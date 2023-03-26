/**
 * Manifold is an extensible node tree system. This is a crude JavaScript
 * implementation and a work-in-progress. API should be considered unstable.
 * 
 * @module
 */
import { componentName, getComponent } from "./components.ts";

export interface RawNode {
  ID:        string;
	Name:      string;
	Value?:     any;
	Parent?:    string|undefined;
	Linked:    {[index: string]: string[]}; // Rel => IDs
	Attrs:     {[index: string]: string};
}

export class Node {
  ID: string;
  module: Module;

  constructor(module: Module, id: string) {
    this.module = module;
    this.ID = id;
  }

  changed() {
    this.module.changed(this);
  }

  get isDestroyed(): boolean {
    return !this.module.nodes.hasOwnProperty(this.ID);
  }

  get raw(): RawNode {
    return this.module.nodes[this.ID];
  }

  getName(): string {
    return this.raw.Name;
  }

  setName(val: string) {
    this.raw.Name = val;
    this.changed();
  }

  getValue(): any {
    return this.raw.Value;
  }

  getParent(): Node|null {
    if (!this.raw.Parent) return null;
    return new Node(this.module, this.raw.Parent);
  }

  setParent(n: Node) {
    const p = this.getParent();
    if (p !== null) {
      p.raw.Linked.Children.splice(this.getSiblingIndex(), 1);
    }
    this.raw.Parent = n.ID;
    n.raw.Linked.Children.push(this.ID);
    this.changed();
  }

  getChildren(): Node[] {
    if (!this.raw.Linked.Children) return [];
    return this.raw.Linked.Children.map(id => new Node(this.module, id));
  }

  childCount(): number {
    if (!this.raw.Linked.Children) return 0;
    return this.raw.Linked.Children.length;
  }

  getAttr(name: string): string {
    return this.raw.Attrs[name] || "";
  }

  setAttr(name: string, value: string) {
    this.raw.Attrs[name] = value;
    this.changed();
  }

  getSiblingIndex(): number {
    const p = this.getParent();
    if (p === null) return 0;
    return p.raw.Linked.Children.findIndex(id => id === this.ID);
  }

  setSiblingIndex(i: number) {
    const p = this.getParent();
    if (p === null) return;
    p.raw.Linked.Children.splice(this.getSiblingIndex(), 1);
    p.raw.Linked.Children.splice(i, 0, this.ID);
    p.changed();
  }

  getPrevSibling(): Node|null {
    const p = this.getParent();
    if (p === null) return null;
    if (this.getSiblingIndex() === 0) return null;
    return p.getChildren()[this.getSiblingIndex()-1];
  }

  getNextSibling(): Node|null {
    const p = this.getParent();
    if (p === null) return null;
    if (this.getSiblingIndex() === p.getChildren().length-1) return null;
    return p.getChildren()[this.getSiblingIndex()+1];
  }

  destroy() {
    // TODO: also walk components of nodes
    const nodes = [];
    this.walk((n: Node): boolean => {
      nodes.push(n);
      return false;
    });
    nodes.reverse().forEach(n => this.module.destroy(n));
  }

  addComponent(obj: any) {
    const node = this.module.new(componentName(obj), obj);
    node.raw.Parent = this.ID;
    this.raw.Linked.Components.push(node.ID);
    this.changed();
  } 

  removeComponent(type: any) {
    const coms = this.getComponentNodes().filter(n => n.getName() === componentName(type));
    if (coms.length > 0) {
      coms[0].destroy();
    }
    this.changed();
  }
  
  hasComponent(type: any): boolean {
    const coms = this.getComponentNodes().filter(n => n.getName() === componentName(type));
    if (coms.length > 0) {
      return true;
    }
    return false;
  }

  getComponent(type: any): any|null {
    const coms = this.getComponentNodes().filter(n => n.getName() === componentName(type));
    if (coms.length > 0) {
      return coms[0].getValue();
    }
    return null;
  }

  getComponentNodes(): Node[] {
    if (!this.raw.Linked.Components) return [];
    return this.raw.Linked.Components.map(id => new Node(this.module, id));
  }

  getPath(): string {
    let cur: Node|null = this;
    const path = [];
    while (cur) {
      path.unshift(cur.getName());
      cur = cur.getParent();
    }
    return path.join("/");
  }

  find(path: string): Node|null {
    return this.module.find([this.getPath(), path].join("/"));
  }

  walk(cb: (n: Node) => boolean): boolean {
    if (cb(this)) {
      return true;
    }
    for (const child of this.getChildren()) {
      if (child.walk(cb)) return true;
    }
    return false;
  }

  // getComponentsInChildren
  // getComponentsInParents
  // getAncestors
  // getPath

  
  // duplicate?
}


export class Module {
  nodes: {[index: string]: RawNode};
  observers: ((n: Node) => void)[];

  constructor() {
    this.nodes = {"@root": {
      ID: "@root",
      Name: "@root",
      Linked: {Children: [], Components: []},
      Attrs: {}
    }};
    this.observers = [];
  }

  import(nodes: RawNode[]) {
    for (const n of nodes) {
      this.nodes[n.ID] = n;
    }
  }

  export(): RawNode[] {
    const nodes: RawNode[] = [];
    for (const n of Object.values(this.nodes)) {
      nodes.push(n);
    }
    return nodes;
  }

  new(name: string, value?: any): Node {
    let parent: Node|null = null;
    if (name.includes("/")) {
      let start: number = 0;
      const parts = name.split("/");
      if (name.startsWith("@")) {
        parent = this.find(parts[0]);
        start = 1;
      } else {
        parent = this.getRoot();
      }
      for (let i = start; i < parts.length-1; i++) {
        if (parent === null) {
          throw "unable to get root";
        }
        let child = parent.find(parts[i]);
        if (!child) {
          child = this.new(parts.slice(0, i+1).join("/"));
        }
        parent = child;
      }
      name = parts[parts.length-1];
    }
    const id = (name.startsWith("@"))?name:uniqueId();
    this.nodes[id] = {
      ID: id,
      Name: name,
      Value: value,
      Linked: {Children: [], Components: []},
      Attrs: {}
    };
    const node = new Node(this, id);
    if (parent) {
      node.setParent(parent)
    }
    return node;
  }

  destroy(n: Node) {
    const p = n.getParent();
    if (p !== null) {
      if (p.raw.Linked.Children.includes(n.ID)) {
        p.raw.Linked.Children.splice(n.getSiblingIndex(), 1);
      }
      if (p.raw.Linked.Components.includes(n.ID)) {
        p.raw.Linked.Components.splice(n.getSiblingIndex(), 1);
      }
    }
    // TODO: walk children and destroy children
    delete this.nodes[n.ID];
    if (p) {
      this.changed(p);
    }
  }

  roots(): Node[] {
    return Object.values(this.nodes).filter(n => n.Parent === undefined).map(n => new Node(this, n.ID));
  }

  changed(n: Node) {
    this.observers.forEach(cb => cb(n));
  }

  getRoot(name?: string): Node|null {
    name = name || "@root"
    const node = this.roots().find(root => root.getName() === name);
    if (node === undefined) return null;
    return node;
  }

  find(path:string): Node|null {
    const byId = this.nodes[path];
    if (byId) return new Node(this, byId.ID);
    const parts = path.split("/");
    if (parts.length === 1 && parts[0].startsWith("@")) {
      // did not find @id by ID so return null
      return null;
    }
    let anchorName = "@root";
    if (parts[0].startsWith("@")) {
      anchorName = parts.shift();
    }
    const findChild = (n: Node, name: string): Node|undefined => {
      return n.getChildren().find(child => child.getName() === name);
    }
    let cur = this.find(anchorName);
    if (!cur) {
      return null;
    }
    for (const name of parts) {
      const child = findChild(cur, name);
      if (!child) return null;
      cur = child;
    }
    return cur;
  }

  walk(cb: (n: Node) => boolean) {
    for (const root of this.roots()) {
      if (root.walk(cb)) return;
    }
  }
}

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2);
  return dateString + randomness;
};


