import {RawNode} from "../manifold/mod.ts";


export interface Backend {
  auth: Authenticator|null;
  index: SearchIndex;
  nodes: NodeStore;
  files: FileStore;
}


export interface Authenticator {
  login();
  logout();
  currentUser(): User|null;
}

export interface User {
  userID(): string;
  displayName(): string;
  avatarURL(): string;
}

export interface SearchIndex {
  index(node: RawNode);
  remove(id: string);
  search(query: string): string[];
}

// TODO: move into workspace
export interface NodeStore {
	async loadAll(): RawNode[];
	async saveAll(nodes: RawNode[]);
}

export interface FileStore {
  async readFile(path: string): string|null;
  async writeFile(path: string, contents: string);
}
