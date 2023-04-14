import { RawNode, Node as INode, Bus as IBus, WalkFunc, ObserverFunc } from "./mod.ts";
import { componentName, getComponent } from "./components.ts";

export class Node {
  _id: string;
  _bus: Bus;

  constructor(bus: Bus, id: string) {
    this._bus = bus;
    this._id = id;
  }

  /* Node interface */

  get id(): string {
    return this._id;
  }

  get bus(): IBus {
    return this._bus;
  }

  get raw(): RawNode {
    return this._bus.nodes[this.id];
  }


  get name(): string {
    return this.raw.Name;
  }

  set name(val: string) {
    this.raw.Name = val;
    this.changed();
  }

  get value(): any {
    return this.raw.Value;
  }

  set value(val: string) {
    this.raw.Value = val;
    this.changed();
  }

  get parent(): INode|null {
    if (!this.raw.Parent) return null;
    return new Node(this._bus, this.raw.Parent);
  }

  set parent(n: INode|null) {
    const p = this.parent;
    if (p !== null) {
      p.raw.Linked.Children.splice(this.siblingIndex, 1);
    }
    if (n !== null) {
      this.raw.Parent = n.id;
      n.raw.Linked.Children.push(this.id);
    } else {
      this.raw.Parent = undefined;
    }
    this.changed();
  }


  get siblingIndex(): number {
    const p = this.parent;
    if (p === null) return 0;
    return p.raw.Linked.Children.findIndex(id => id === this.id);
  }

  set siblingIndex(i: number) {
    const p = this.parent;
    if (p === null) return;
    p.raw.Linked.Children.splice(this.siblingIndex, 1);
    p.raw.Linked.Children.splice(i, 0, this.id);
    p.changed();
  }

  get prevSibling(): INode|null {
    const p = this.parent;
    if (p === null) return null;
    if (this.siblingIndex === 0) return null;
    return p.children[this.siblingIndex-1];
  }

  get nextSibling(): INode|null {
    const p = this.parent;
    if (p === null) return null;
    if (this.siblingIndex === p.children.length-1) return null;
    return p.children[this.siblingIndex+1];
  }

  get ancestors(): INode[] {
    const anc = [];
    let p = this.parent;
    while (p !== null) {
      anc.push(p);
      p = p.parent;
    }
    return anc;
  }

  get isDestroyed(): boolean {
    return !this._bus.nodes.hasOwnProperty(this.id);
  }

  get path(): string {
    let cur: INode|null = this;
    const path = [];
    while (cur) {
      path.unshift(cur.name);
      cur = cur.parent;
    }
    return path.join("/");
  }

  get children(): INode[] {
    if (!this.raw.Linked.Children) return [];
    return this.raw.Linked.Children.map(id => new Node(this._bus, id));
  }

  get childCount(): number {
    if (!this.raw.Linked.Children) return 0;
    return this.raw.Linked.Children.length;
  }

  addChild(node: INode) {
    this.raw.Linked.Children.push(node.id);
    this.changed();
  } 

  removeChild(node: INode) {
    const children = this.raw.Linked.Children.filter(id => id === node.id);
    this.raw.Linked.Children = children;
    this.changed();
  }


  get components(): INode[] {
    if (!this.raw.Linked.Components) return [];
    return this.raw.Linked.Components.map(id => new Node(this._bus, id));
  }

  get componentCount(): number {
    if (!this.raw.Linked.Components) return 0;
    return this.raw.Linked.Components.length;
  }

  addComponent(obj: any) {
    const node = this.bus.make(componentName(obj), obj);
    node.raw.Parent = this.id;
    this.raw.Linked.Components.push(node.id);
    this.changed();
  } 

  removeComponent(type: any) {
    const coms = this.components.filter(n => n.name === componentName(type));
    if (coms.length > 0) {
      coms[0].destroy();
    }
    this.changed();
  }
  
  hasComponent(type: any): boolean {
    const coms = this.components.filter(n => n.name === componentName(type));
    if (coms.length > 0) {
      return true;
    }
    return false;
  }

  getComponent(type: any): any|null {
    const coms = this.components.filter(n => n.name === componentName(type));
    if (coms.length > 0) {
      return coms[0].value;
    }
    return null;
  }
  // getComponentsInChildren
  // getComponentsInParents

  getLinked(rel: string): INode[] {
    if (!this.raw.Linked[rel]) return [];
    return this.raw.Linked[rel].map(id => new Node(this._bus, id));
  }

  addLinked(rel: string, node: INode) {
    this.raw.Linked[rel].push(node.id);
    this.changed();
  } 

  removeLinked(rel: string, node: INode) {
    const linked = this.raw.Linked[rel].filter(id => id === node.id);
    this.raw.Linked[rel] = linked;
    this.changed();
  }

  moveLinked(rel: string, node: INode, idx: number) {
    const oldIdx = this.raw.Linked[rel].findIndex(id => id === node.id);
    if (oldIdx === -1) return;
    const linked = this.raw.Linked[rel];
    linked.splice(idx, 0, linked.splice(oldIdx, 1)[0]);
    this.raw.Linked[rel] = linked;
    this.changed();
  }

  getAttr(name: string): string {
    return this.raw.Attrs[name] || "";
  }

  setAttr(name: string, value: string) {
    this.raw.Attrs[name] = value;
    this.changed();
  }

  find(path: string): INode|null {
    return this.bus.find([this.path, path].join("/"));
  }

  walk(fn: WalkFunc): boolean {
    if (fn(this)) {
      return true;
    }
    for (const child of this.children) {
      if (child.walk(fn)) return true;
    }
    return false;
  }

  destroy() {
    // TODO: also walk components of nodes
    const nodes: INode[] = [];
    this.walk((n: INode): boolean => {
      nodes.push(n);
      return false;
    });
    nodes.reverse().forEach(n => this._bus.destroy(n));
  }

  changed() {
    this._bus.changed(this);
  }
  
  // duplicate?
}





export class Bus {
  nodes: Record<string, RawNode>;
  observers: ObserverFunc[];

  constructor() {
    this.nodes = {"@root": {
      ID: "@root",
      Name: "@root",
      Linked: {Children: [], Components: []},
      Attrs: {}
    }};
    this.observers = [];
  }

  changed(n: INode) {
    this.observers.forEach(cb => cb(n));
  }

  /* Bus interface */

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

  make(name: string, value?: any): INode {
    let parent: INode|null = null;
    if (name.includes("/")) {
      let start: number = 0;
      const parts = name.split("/");
      if (name.startsWith("@")) {
        parent = this.find(parts[0]);
        start = 1;
      } else {
        parent = this.root();
      }
      for (let i = start; i < parts.length-1; i++) {
        if (parent === null) {
          throw "unable to get root";
        }
        let child = parent.find(parts[i]);
        if (!child) {
          child = this.make(parts.slice(0, i+1).join("/"));
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
      node.parent = parent;
    }
    return node;
  }

  destroy(n: INode) {
    const p = n.parent;
    if (p !== null) {
      if (p.raw.Linked.Children.includes(n.id)) {
        p.raw.Linked.Children.splice(n.siblingIndex, 1);
      }
      if (p.raw.Linked.Components.includes(n.id)) {
        p.raw.Linked.Components.splice(n.siblingIndex, 1);
      }
    }
    // TODO: walk children and destroy children
    delete this.nodes[n.id];
    if (p) {
      this.changed(p);
    }
  }

  roots(): INode[] {
    return Object.values(this.nodes).filter(n => n.Parent === undefined).map(n => new Node(this, n.ID));
  }

  root(name?: string): INode|null {
    name = name || "@root"
    const node = this.roots().find(root => root.name === name);
    if (node === undefined) return null;
    return node;
  }

  find(path:string): INode|null {
    const byId = this.nodes[path];
    if (byId) return new Node(this, byId.ID);
    const parts = path.split("/");
    if (parts.length === 1 && parts[0].startsWith("@")) {
      // did not find @id by ID so return null
      return null;
    }
    let anchorName = "@root";
    if (parts[0].startsWith("@")) {
      anchorName = parts.shift() || "";
    }
    const findChild = (n: INode, name: string): INode|undefined => {
      return n.children.find(child => child.name === name);
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

  walk(fn: WalkFunc) {
    for (const root of this.roots()) {
      if (root.walk(fn)) return;
    }
  }

  observe(fn: ObserverFunc) {
    this.observers.push(fn);
  }
}

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2);
  return dateString + randomness;
};
