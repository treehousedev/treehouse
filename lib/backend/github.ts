
import { Authenticator, SearchIndex, FileStore, ChangeNotifier } from "./mod.ts";
import { BrowserBackend } from "./browser.ts";
import { encode, decode } from 'https://cdn.jsdelivr.net/npm/js-base64@3.7.5/base64.mjs';

export interface Options {
  domain: string;           // domain used with username subdomain to produce repo name
  checkDomain: boolean;     // redirect to user domain if it is not current location
  authFallbackURL?: string; // URL to redirect to if auth fails
  privateRepo?: boolean;    // if the user workspace repo should be created private
}

export class GitHubBackend {
  auth: Authenticator;

  index: SearchIndex;
  files: FileStore;
  changes?: ChangeNotifier;

  loginURL: string;
  clientFactory: any; // Octokit class
  client: any; // Octokit instance
  user: User|null;
  shas: Record<string, string>; // path => sha
  
  opts: Options;

  constructor(loginURL: string, octokit: any, opts?: Options) {
    this.loginURL = loginURL;
    this.clientFactory = octokit;
    this.auth = this;
    this.shas = {};

    this.opts = Object.assign({
      domain: "treehouse.sh",
      checkDomain: false,
      privateRepo: false
    }, opts || {});

    // fallbacks
    const localbackend = new BrowserBackend();
    this.index = localbackend.index;
    this.files = localbackend.files;

    
  }

  get repoName(): string {
    return `${this.user?.userID().toLowerCase()}.${this.opts.domain}`;
  }

  async initialize() {
    // delegate authorize callback to loginURL
    const code = new URL(location.href).searchParams.get("code");
    if (code) {
      try {
        // remove ?code=... from URL
        const querystring = location.search.replace(/\bcode=\w+/, "").replace(/\?$/, "");
        history.pushState({}, "", `${location.pathname}${querystring}`);
  
        const response = await fetch(this.loginURL, {
          method: "POST",
          mode: "cors",
          headers: {"content-type": "application/json"},
          body: JSON.stringify({ code })
        });
        
        const result = await response.json();
        if (result.error) {
          throw result.error;
        }
        
        localStorage.setItem("treehouse:gh-token", result.token);
  
      } catch (e: Error) {
        this.reset();
        console.error(e);
        return;
      }
    }

    // capture access token if provided directly
    const token = new URL(location.href).searchParams.get("access_token");
    if (token) {
      try {
        // remove ?access_token=... from URL
        const querystring = location.search.replace(/\baccess_token=\w+/, "").replace(/\?$/, "");
        history.pushState({}, "", `${location.pathname}${querystring}`);
        
        localStorage.setItem("treehouse:gh-token", token);
      } catch (e: Error) {
        this.reset();
        console.error(e);
        return;
      }
    }

    try {
      await this.authenticate();
      if (!this.user) {
        throw "authentication failed";
      }
    } catch (e: Error) {
      console.error(e);
      if (this.opts.authFallbackURL) {
        location.href = this.opts.authFallbackURL;
      }
      return;
    }
    
    // check domain if set to
    if (this.opts.checkDomain && this.repoName !== location.hostname.toLowerCase()) {
      location.hostname = this.repoName;
      return;
    }

    // check if repo exists
    try {
      await this.client.rest.repos.get({
        owner: this.user.userID(), 
        repo: this.repoName
      });
    } catch (e: Error) {
      if (e.message !== "Not Found") {
        throw e;
      }
      // create if not
      console.log("Creating repository...");
      const resp = await this.client.rest.repos.createForAuthenticatedUser({name: this.repoName, private: this.opts.privateRepo});
      if (resp.status !== 201) {
        console.error(resp);
        return;
      }
    }

    // check for workspace.json now
    try {
      await this.client.rest.repos.getContent({
        owner: this.user.userID(), 
        repo: this.repoName,
        path: "workspace.json"
      });
    } catch (e: Error) {
      if (e.name !== "HttpError") {
        throw e;
      }
      // create empty if not
      console.log("Creating workspace.json...");
      const resp = await this.client.rest.repos.createOrUpdateFileContents({
        owner: this.user.userID(), 
        repo: this.repoName,
        path: "workspace.json", 
        message: "initial commit", 
        content: btoa(JSON.stringify([]))
      });
      if (resp.status !== 201) {
        console.error(resp);
        return;
      }
    }
    
    // satisfy filestore interface with methods on this
    this.files = this;
    
    // create and regularly check a session lockfile
    const sessID = uniqueID();
    await this.readFile("treehouse.lock");
    await this.writeFile("treehouse.lock", sessID);
    const lockCheck = setInterval(async () => {
      const lockFile = await this.readFile("treehouse.lock");
      if (lockFile !== sessID) {
        clearInterval(lockCheck);
        document.dispatchEvent(new CustomEvent("BackendError"));
        console.warn("lock stolen!");
      }
    }, 5000);
  }

  async loadExtensions() {
    try {
      const dirCheck = await this.client.rest.repos.getContent({
        owner: this.user?.userID(), 
        repo: this.repoName, 
        path: "",
        random: Math.random().toString(36).substring(2)
      });
      if (dirCheck.data.find(o => o.type === "dir" && o.name === "ext")) {
        const dirList = await this.client.rest.repos.getContent({
          owner: this.user?.userID(), 
          repo: this.repoName, 
          path: "ext",
          random: Math.random().toString(36).substring(2)
        });
        for (const file of dirList.data) {
          if (file.name.endsWith(".css")) {
            // Load CSS 
            const resp = await this.client.rest.repos.getContent({
              owner: this.user?.userID(), 
              repo: this.repoName, 
              path: file.path,
              random: Math.random().toString(36).substring(2)
            });
            const css = document.createElement("link");
            css.setAttribute("href", `data:text/css;charset=utf-8;base64,${resp.data.content}`);
            css.setAttribute("rel", "stylesheet");
            css.setAttribute("type", "text/css");
            document.head.appendChild(css);
          } else if (file.name.endsWith(".js")) {
            // Load JavaScript
            const resp = await this.client.rest.repos.getContent({
              owner: this.user?.userID(), 
              repo: this.repoName, 
              path: file.path,
              random: Math.random().toString(36).substring(2)
            });
            const js = document.createElement("script");
            js.setAttribute("type", "module");
            js.setAttribute("src", `data:text/javascript;charset=utf-8;base64,${resp.data.content}`);
            document.head.appendChild(js);
          }
        }
      }
      
    } catch (e: Error) {}
    
  }
  
  async authenticate() {
    const token = localStorage.getItem("treehouse:gh-token");
    if (!token) {
      return;
    }

    this.client = new this.clientFactory({auth: token});
    const resp = await this.client.rest.users.getAuthenticated();
    if (!resp || resp.error) {
      return;
    }
    this.user = new User(resp.data);

    if(m)m.redraw();
  }

  currentUser(): User|null {
    return this.user;
  }

  login() {
    location.assign(this.loginURL);
  }

  reset() {
    localStorage.removeItem("treehouse:gh-token");
    this.user = null;

    if(m)m.redraw();
  }
  
  logout() {
    this.reset();
    location.reload();
  }


  async readFile(path: string): Promise<string|null> {
    try {
      const resp = await this.client.rest.repos.getContent({
        owner: this.user?.userID(), 
        repo: this.repoName, 
        path: path,
        random: Math.random().toString(36).substring(2)
      });
      this.shas[path] = resp.data.sha;
      return decode(resp.data.content);
    } catch (e: Error) {
      if (e.name !== "HttpError") {
        console.error(e);
      }
      return null;
    }
  }

  async writeFile(path: string, contents: string) {
    const resp = await this.client.rest.repos.createOrUpdateFileContents({
      owner: this.user?.userID(), 
      repo: this.repoName, 
      path: path, 
      message: "autosave", 
      content: encode(contents), 
      sha: this.shas[path]
    });
    this.shas[path] = resp.data.content.sha;
  }
}

export class User {
  user: any; // github user object

  constructor(user: any) {
    this.user = user;
  }

  userID(): string {
    return this.user.login;
  }

  displayName(): string {
    return this.user.name;
  }

  avatarURL(): string {
    return this.user.avatar_url;
  }
}

function uniqueID() {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2);
  return dateString + randomness;
};