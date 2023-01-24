import {RawNode} from "../manifold/mod.ts";


export interface Store {
	loadAll(): RawNode[]
	saveAll(nodes: RawNode[])
	save(n: RawNode)
}

export class LocalStorageStore {
  loadAll(): RawNode[] {
    let item = localStorage.getItem(`treehouse-nodes`);
    if (item === "undefined") {
      item = undefined;
    }
    return JSON.parse(item || "[]");
  }
	
  saveAll(nodes: RawNode[]) {
    localStorage.setItem(`treehouse-nodes`, JSON.stringify(nodes));
  }
	
  save(n: RawNode) {
    //this.saveAll();
  }
}