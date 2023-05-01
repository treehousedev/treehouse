import { FileStore } from "../backend/mod.ts";
import { Bus, Node, RawNode } from "../model/mod.ts";
import * as module from "../model/module/mod.ts";


/**
 * Workspace is a container for nodes and manages marshaling them using
 * the FileStore backend API. It also keeps track of what nodes have been
 * expanded and what node was last opened. It serializes as JSON with a
 * version indicator and will handle migrations of old versions to the 
 * latest when loading. Saving is currently debounced here so this applies
 * to all backends. 
 */
export class Workspace {
  fs: FileStore;
  bus: Bus;

  lastOpenedID: string;
  expanded: {[key: string]: {[key: string]: boolean}}; // [rootid][id]

  constructor(fs: FileStore) {
    this.fs = fs;
    this.bus = new module.Bus();
    this.expanded = {};

    this.writeDebounce = debounce(async (path, contents) => {
      try {
        await this.fs.writeFile(path, contents);
        console.log("Saved workspace.");
      } catch (e: Error) {
        console.error(e);
        document.dispatchEvent(new CustomEvent("BackendError"));
      }
    });
  }

  get rawNodes(): RawNode[] {
    return this.bus.export();
  }

  observe(fn: (n: Node) => void) {
    this.bus.observe(fn);
  }

  save() {
    this.writeDebounce("workspace.json", JSON.stringify({
      version: 1,
      lastopen: this.lastOpenedID,
      expanded: this.expanded,
      nodes: this.rawNodes
    }, null, 2));
  }

  async load() {
    let doc = JSON.parse(await this.fs.readFile("workspace.json") || "{}");
    if (Array.isArray(doc)) {
      doc = {
        version: 0,
        nodes: doc
      }
    }
    if (doc.nodes) {
      this.bus.import(doc.nodes);
      console.log(`Loaded ${doc.nodes.length} nodes.`);
    }
    if (doc.expanded) {
      this.expanded = doc.expanded;
    }
    if (doc.lastopen) {
      this.lastOpenedID = doc.lastopen;
    }
    
  }

  mainNode(): Node {
    let main = this.bus.find("@workspace");
    if (!main) {
      console.info("Building missing workspace node.")
      const root = this.bus.find("@root");
      const ws = this.bus.make("@workspace");
      ws.name = "Workspace";
      ws.parent = root;
      const cal = this.bus.make("@calendar");
      cal.name = "Calendar";
      cal.parent = ws;
      const home = this.bus.make("Home");
      home.parent = ws;
      main = ws;
    }
    return main;
  }

  find(path:string): Node|null {
    return this.bus.find(path)
  }

  new(name: string, value?: any): Node {
    return this.bus.make(name, value);
  }


  getExpanded(head: Node, n: Node): boolean {
    if (!this.expanded[head.id]) {
      this.expanded[head.id] = {};
    }
    let expanded = this.expanded[head.id][n.id];
    if (expanded === undefined) {
      expanded = false;
    }
    return expanded;
  }

  setExpanded(head: Node, n: Node, b: boolean) {
    this.expanded[head.id][n.id] = b;
    this.save();
    //localStorage.setItem(this.expandedKey, JSON.stringify(this.expanded));
  }

  findAbove(head: Node, n: Node): Node|null {
    // TODO: Fields
    if (n.id === head.id) {
      return null;
    }
    let above = n.prevSibling;
    if (!above) {
      return n.parent;
    }
    const lastChildIfExpanded = (n: Node): Node => {
      const expanded = this.getExpanded(head, n);
      if (!expanded || n.childCount === 0) {
        return n;
      }
      const lastChild = n.children[n.childCount - 1];
      return lastChildIfExpanded(lastChild);
    }
    return lastChildIfExpanded(above);
  }

  findBelow(head: Node, n: Node): Node|null {
    // TODO: find a way to indicate pseudo "new" node for expanded leaf nodes
    if (this.getExpanded(head, n) && n.getLinked("Fields").length > 0) {
      return n.getLinked("Fields")[0];
    }
    if (this.getExpanded(head, n) && n.childCount > 0) {
      return n.children[0];
    }
    const nextSiblingOrParentNextSibling = (n: Node): Node|null => {
      const below = n.nextSibling;
      if (below) {
        return below;
      }
      const parent = n.parent;
      if (!parent || parent.id === head.id) {
        return null;
      }
      if (n.raw.Rel === "Fields" && parent.childCount > 0) {
        return parent.children[0];
      }
      return nextSiblingOrParentNextSibling(parent);
    }
    return nextSiblingOrParentNextSibling(n);
  }

}


function debounce(func, timeout = 3000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
