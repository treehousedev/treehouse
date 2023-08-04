---
layout: layouts/docs.tsx
title: Backend Adapters
---
## Backend Adapters

Backend adapters are classes that implement the backend API for a given backend. If you wanted to make your own custom backend, you would implement your own backend adapter
implementing the APIs you wish to hook into and pass that into the `setup` function when initializing Treehouse. We also have a handful of built-in adapters for public or
well-known backend interfaces:

### lib/backend/browser.ts

This backend implements the FileStorage API using localStorage. This means data will be stored in the browser for a particular device. It also implements search indexing
using MiniSearch. It does not implement the Authenticator API.

### lib/backend/github.ts

This backend implements the FileStorage API using the GitHub API to store data in a GitHub hosted Git repository. It also implements the Authenticator API against a 
script that can be hosted on CloudFlare Workers that implements an OAuth client for the GitHub API. This backend adapter does not implement a search index, it simply
uses the browser implementation (MiniSearch).

### lib/backend/filesystem.ts (coming soon)

This backend implements the FileStorage API using a local filesystem. Since there isn't a good standard filesystem API in browsers, this implementation operates against
a simple REST API that can be implemented by a backend host process, such as Electron, Apptron, or something custom. 

### Writing an Adapter

An adapter is just an object that implements this API:

```js
interface Backend {
  auth: Authenticator|null;
  index: SearchIndex;
  files: FileStore;
}

interface Authenticator {
  login();
  logout();
  currentUser(): User|null;
}

interface User {
  userID(): string;
  displayName(): string;
  avatarURL(): string;
}

interface SearchIndex {
  index(node: RawNode);
  remove(id: string);
  search(query: string): string[];
}

interface FileStore {
  async readFile(path: string): string|null;
  async writeFile(path: string, contents: string);
}
```

The Authenticator API is optional (and soon so might the SearchIndex API, always defaulting to MiniSearch). Typically a backend adapter will
set `auth`, `index`, and `files` to `this` and implement each of those interfaces on that same object.