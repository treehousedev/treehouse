import {RawNode} from "../manifold/mod.ts";


export class BrowserBackend {
  auth: null;
  index: SearchIndex;
  nodes: NodeStore;
  files: FileStore;

  constructor() {
    this.auth = null;
    this.files = new FileStore();
    this.nodes = new NodeStore(this.files);
    if (window.MiniSearch) {
      this.index = new SearchIndex_MiniSearch();
    } else {
      this.index = new SearchIndex_Dumb();
    }
  }
}

export class SearchIndex_MiniSearch {
  indexer: any; // MiniSearch

  constructor() {
    this.indexer = new MiniSearch({
      idField: "ID",
      fields: ['ID', 'Name', 'Value.markdown'], // fields to index for full-text search
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
    this.indexer.discard(id);
  }

  search(query: string): string[] {
    const suggested = this.indexer.autoSuggest(query);
    if (suggested.length === 0) return [];
    return this.indexer.search(suggested[0].suggestion).map(doc => doc.ID);
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



// TODO: move into workspace
export class NodeStore {
  files: FileStore;

  constructor(files: FileStore) {
    this.files = files;
  }

  async loadAll(): RawNode[] {
    return JSON.parse(await this.files.readFile("workspace.json") || "[]");
  }
	
  async saveAll(nodes: RawNode[]) {
    await this.files.writeFile("workspace.json", JSON.stringify(nodes));
  }
}

export class FileStore {
  async readFile(path: string): string|null {
    return localStorage.getItem(`treehouse:${path}`);
  }

  async writeFile(path: string, contents: string) {
    localStorage.setItem(`treehouse:${path}`, contents);
  }
}