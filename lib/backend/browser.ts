import {RawNode} from "../model/mod.ts";
import { SearchIndex, FileStore, ChangeNotifier } from "./mod.ts";

export class BrowserBackend {
  auth: null;
  index: SearchIndex;
  files: FileStore;
  changes?: ChangeNotifier;

  constructor() {
    this.auth = null;
    this.files = new LocalStorageFileStore();
    if (window.MiniSearch) {
      this.index = new SearchIndex_MiniSearch();
    } else {
      this.index = new SearchIndex_Dumb();
    }
    this.changes = {
      registerNotifier(cb: (nodeIDs: string[]) => void) {
        window.reloadNodes = cb;
      }
    };
  }
}

export class SearchIndex_MiniSearch {
  indexer: any; // MiniSearch

  constructor() {
    this.indexer = new MiniSearch({
      idField: "ID",
      fields: ['ID', 'Name', 'Value', 'Value.markdown'], // fields to index for full-text search
      storeFields: ['ID'], // fields to return with search results
      extractField: (document, fieldName) => {
        return fieldName.split('.').reduce((doc, key) => doc && doc[key], document);
      }
    });
  }

  index(node: RawNode) {
    if (this.indexer.has(node.ID)) {
      this.indexer.replace(node);  
    } else {
      this.indexer.add(node);
    }
  }

  remove(id: string) {
    try {
      this.indexer.discard(id);
    } catch {}
  }

  search(query: string): string[] {
    const suggested = this.indexer.autoSuggest(query);
    if (suggested.length === 0) return [];
    return this.indexer.search(suggested[0].suggestion, {
      prefix: true,
      combineWith: 'AND',
    }).map(doc => doc.ID);
  }
}


export class SearchIndex_Dumb {
  nodes: Record<string, string>;

  constructor() {
    this.nodes = {};
  }

  index(node: RawNode) {
    this.nodes[node.ID] = node.Name;
  }

  remove(id: string) {
    delete this.nodes[id];
  }

  search(query: string): string[] {
    const results: string[] = [];
    for (const id in this.nodes) {
      if (this.nodes[id].includes(query)) {
        results.push(id);
      }
    }
    return results;
  }
}



export class LocalStorageFileStore {
  async readFile(path: string): Promise<string|null> {
    return localStorage.getItem(`treehouse:${path}`);
  }

  async writeFile(path: string, contents: string) {
    localStorage.setItem(`treehouse:${path}`, contents);
  }
}