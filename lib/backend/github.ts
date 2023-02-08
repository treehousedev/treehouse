import {RawNode} from "../manifold/mod.ts";
import { Authenticator, SearchIndex, NodeStore, FileStore } from "./mod.ts";
import { BrowserBackend } from "./browser.ts";

export class GitHubBackend {
  auth: Authenticator;

  index: SearchIndex;
  nodes: NodeStore;
  files: FileStore;

  loginURL: string;
  clientFactory: any; // Octokit class
  client: any; // Octokit instance
  user: User|null;
  shas: Record<string, string>; // path => sha

  constructor(loginURL: string, octokit: any) {
    this.loginURL = loginURL;
    this.clientFactory = octokit;
    this.auth = this;
    this.shas = {};

    const localbackend = new BrowserBackend();
    this.index = localbackend.index;
    this.nodes = localbackend.nodes;
    this.files = localbackend.files;

    this.writeDebounce = debounce((path, contents) => {
      console.log("Saving workspace...");
      this.writeFile(path, contents);
    });
  }

  get repo(): string {
    return `${this.user?.userID()}.treehouse.sh`;
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

    await this.authenticate();
    if (!this.user) {
      console.error("authentication failed");
      return;
    }

    // check if repo exists
    try {
      await this.client.rest.repos.get({
        owner: this.user.userID(), 
        repo: this.repo
      });
    } catch (e: Error) {
      if (e.message !== "Not Found") {
        throw e;
      }
      // create if not
      console.log("Creating repository...");
      const resp = await this.client.rest.repos.createForAuthenticatedUser({name: this.repo});
      if (resp.status !== 201) {
        console.error(resp);
        return;
      }
    }

    // check for workspace.json now
    try {
      await this.client.rest.repos.getContent({
        owner: this.user.userID(), 
        repo: this.repo,
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
        repo: this.repo,
        path: "workspace.json", 
        message: "initial commit", 
        content: btoa(JSON.stringify([]))
      });
      if (resp.status !== 201) {
        console.error(resp);
        return;
      }
    }
    
    this.files = this;
    this.nodes = this;

    
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

  async loadAll(): RawNode[] {
    return JSON.parse(await this.readFile("workspace.json") || "[]");
  }
	
  async saveAll(nodes: RawNode[]) {
    this.writeDebounce("workspace.json", JSON.stringify(nodes, null, 2));
  }

  async readFile(path: string): string|null {
    try {
      const resp = await this.client.rest.repos.getContent({
        owner: this.user?.userID(), 
        repo: this.repo, 
        path: path,
        random: Math.random().toString(36).substring(2)
      });
      this.shas[path] = resp.data.sha;
      return atob(resp.data.content);
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
      repo: this.repo, 
      path: path, 
      message: "autosave", 
      content: btoa(contents), 
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

function debounce(func, timeout = 3000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}