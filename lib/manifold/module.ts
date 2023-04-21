import { RawNode, Node as INode, Bus as IBus, WalkFunc, ObserverFunc, WalkOptions } from "./mod.ts";
import { componentName, getComponent, inflateToComponent } from "./components.ts";
import { triggerHook, hasHook } from "./hooks.ts";

export class Node {
  _id: string;
  _bus: Bus;

  constructor(bus: Bus, id: string) {
    this._bus = bus;
    this._id = id;
  }

  [Symbol.for("Deno.customInspect")]() {
    return `Node[${this.id}:${this.name}]`;
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
    if (this.refTo) {
      return this.refTo.name;
    }
    return this.raw.Name;
  }

  set name(val: string) {
    if (this.refTo) {
      this.refTo.name = val;
    } else {
      this.raw.Name = val;
    }
    this.changed();
  }

  get value(): any {
    if (this.refTo) {
      return this.refTo.value;
    }
    return this.raw.Value;
  }

  set value(val: string) {
    if (this.refTo) {
      this.refTo.value = val;
    } else {
      this.raw.Value = val;
    }
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
      triggerHook(n, "onAttach", n);
    } else {
      this.raw.Parent = undefined;
    }
    this.changed();
  }

  get refTo(): INode|null {
    const id = this.raw.Attrs["refTo"];
    if (!id) return null;
    const refTo = this._bus.nodes[id];
    if (!refTo) return null;
    return new Node(this._bus, id);
  }

  set refTo(n: INode|null) {
    if (!n) {
      delete this.raw.Attrs["refTo"];
      this.changed();
      return;
    }
    this.raw.Attrs["refTo"] = n.id;
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
    if (this.refTo) return this.refTo.children;
    let children: INode[] = [];
    if (this.raw.Linked.Children) {
      children = this.raw.Linked.Children.map(id => new Node(this._bus, id));
    };
    for (const com of this.components) {
      if (hasHook(com, "objectChildren")) {
        return triggerHook(com, "objectChildren", this, children);
      }
    }
    return children;
  }

  get childCount(): number {
    if (this.refTo) return this.refTo.childCount;
    for (const com of this.components) {
      if (hasHook(com, "objectChildren")) {
        return triggerHook(com, "objectChildren", this, null).length;
      }
    }
    if (!this.raw.Linked.Children) return 0;
    return this.raw.Linked.Children.length;
  }

  addChild(node: INode) {
    if (this.refTo) {
      this.refTo.addChild(node);
      return;
    }
    this.raw.Linked.Children.push(node.id);
    this.changed();
  } 

  removeChild(node: INode) {
    if (this.refTo) {
      this.refTo.removeChild(node);
      return;
    }
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
    triggerHook(node, "onAttach", node);
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
    if (!this.raw.Linked[rel]) {
      this.raw.Linked[rel] = [];
    }
    this.raw.Linked[rel].push(node.id);
    this.changed();
  } 

  removeLinked(rel: string, node: INode) {
    if (!this.raw.Linked[rel]) {
      this.raw.Linked[rel] = [];
    }
    const linked = this.raw.Linked[rel].filter(id => id === node.id);
    this.raw.Linked[rel] = linked;
    this.changed();
  }

  moveLinked(rel: string, node: INode, idx: number) {
    if (!this.raw.Linked[rel]) {
      this.raw.Linked[rel] = [];
    }
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

  walk(fn: WalkFunc, opts?: WalkOptions): boolean {
    opts = opts || {
      followRefs: false,
      includeComponents: false
    };
    if (fn(this)) {
      return true;
    }
    let children = this.children;
    if (this.refTo && opts.followRefs) {
      if (fn(this.refTo)) {
        return true;
      }
      children = this.refTo.children;
    }
    for (const child of children) {
      if (child.walk(fn, opts)) return true;
    }
    if (opts.includeComponents) {
      for (const com of this.components) {
        if (com.walk(fn, opts)) return true;
      }
    }
    return false;
  }

  destroy() {
    if (this.isDestroyed) return;
    if (this.refTo) {
      this._bus.destroy(this);
      return;
    }
    const nodes: INode[] = [];
    this.walk((n: INode): boolean => {
      nodes.push(n);
      return false;
    }, {
      followRefs: false,
      includeComponents: true
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
      if (n.Value && getComponent(n.Name)) {
        n.Value = inflateToComponent(n.Name, n.Value);
      }
      this.nodes[n.ID] = n;
    }
    for (const n of nodes) {
      const node = this.find(n.ID);
      if (node) {
        // check orphan
        if (node.parent && !node.parent.raw) {
          delete this.nodes[n.ID];
          continue
        }
        // trigger attach
        triggerHook(node, "onAttach", node);
      }
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
      const parts = name.split("/");
      parent = this.root(parts[0]);
      for (let i = 1; i < parts.length-1; i++) {
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

  // destroys node but not linked nodes
  destroy(n: INode) {
    const p = n.parent;
    if (p !== null && !p.isDestroyed) {
      if (p.raw.Linked.Children.includes(n.id)) {
        p.raw.Linked.Children.splice(n.siblingIndex, 1);
      }
      if (p.raw.Linked.Components.includes(n.id)) {
        p.raw.Linked.Components.splice(n.siblingIndex, 1);
      }
    }
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
    let cur = this.root(parts[0]);
    if (cur) {
      parts.shift();
    } else {
      cur = this.root("@root"); 
    }
    if (!cur) {
      return null;
    }
    const findChild = (n: INode, name: string): INode|undefined => {
      if (n.refTo) {
        n = n.refTo;
      }
      return n.children.find(child => child.name === name);
    }
    for (const name of parts) {
      const child = findChild(cur, name);
      if (!child) return null;
      cur = child;
    }
    return cur;
  }

  walk(fn: WalkFunc, opts?: WalkOptions) {
    for (const root of this.roots()) {
      if (root.walk(fn, opts)) return;
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
