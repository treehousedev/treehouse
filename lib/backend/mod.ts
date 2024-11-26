/**
 * Backend provides the APIs to implement a backend adapter as well
 * as several built-in backend adapters. These are instantiated and
 * passed to `setup` for a working SPA. 
 * 
 * @module
 */
import {RawNode} from "../model/mod.ts";

/**
 * Backend is the adapter object API to be implemented for a working backend.
 * Typically these fields are set to `this` and the different APIs are
 * implemented on the same object. 
 */
export interface Backend {
  auth: Authenticator|null;
  index: SearchIndex;
  files: FileStore;
  changes?: ChangeNotifier;
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

export interface FileStore {
  readFile(path: string): Promise<string|null>;
  writeFile(path: string, contents: string): Promise<void>;
}

export interface ChangeNotifier {
  registerNotifier(cb: (nodeIDs: string[]) => void);
}
