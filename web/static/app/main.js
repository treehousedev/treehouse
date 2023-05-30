import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
import {setup, BrowserBackend, GitHubBackend} from "/lib/treehouse.min.js";

setup(document, document.body, {
  "browser": new BrowserBackend(),
  "github": new GitHubBackend(`${window.backend.url}?scope=repo`, Octokit)
}[window.backend.name]);

setTimeout(() => {
  if (!localStorage.getItem("firsttime")) {
    window.workbench.showNotice('firsttime');
  }
}, 2000)
