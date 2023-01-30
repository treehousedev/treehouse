
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
    this.module.destroy(this);
  }

  // getAncestors
  // getPath

  // addComponent
  // getComponent
  // getComponents
  // getComponentsInChildren
  // getComponentsInParents

  // walk
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
    const id = (name.startsWith("@"))?name:uniqueId();
    this.nodes[id] = {
      ID: id,
      Name: name,
      Value: value,
      Linked: {Children: [], Components: []},
      Attrs: {}
    };
    return new Node(this, id);
  }

  destroy(n: Node) {
    const p = n.getParent();
    if (p !== null) {
      p.raw.Linked.Children.splice(n.getSiblingIndex(), 1);
    }
    // TODO: walk children and destroy children
    delete this.nodes[n.ID];
  }

  roots(): Node[] {
    return Object.values(this.nodes).filter(n => n.Parent === undefined).map(n => new Node(this, n.ID));
  }

  changed(n: Node) {
    this.observers.forEach(cb => cb(n));
  }

  find(name:string): Node|null {
    // TODO: full paths instead of just name
    for (const n of Object.values(this.nodes)) {
      if (n.Name === name) {
        return new Node(this, n.ID);
      }
    }
    return null;
  }
}

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substring(2);
  return dateString + randomness;
};

export function newNode(name: string): RawNode {
  return {ID: uniqueId(), Name: name, Linked: {Children: []}, Attrs: {}};
}

export function generateNodes(count: number): RawNode[] {
  const nodes: RawNode[] = [];
  for (let i: number = 0; i<count; i++) {
    nodes.push(newNode(generateWords(randomNumber(2, 6))));
  }
  return nodes;
}

export function generateNodeTree(count: number): {[index: string]: RawNode} {
  const nodes: {[index: string]: RawNode} = {};
  const generated: RawNode[] = generateNodes(count);
  generated.forEach(n => {
    nodes[n.ID] = n;
    if (randomNumber(0,4) > 0) {
      n.Parent = generated[randomNumber(0, count-1)].ID;
    }
  })
  for (const [id, n] of Object.entries(nodes)) {
    if (n.Parent === n.ID) {
      n.Parent = undefined;
    }
    if (n.Parent) {
      nodes[n.Parent].Linked.Children.push(n.ID);
    }
  }
  return nodes;
}

const words = [
  'Got',
  'ability',
  'shop',
  'recall',
  'fruit',
  'easy',
  'dirty',
  'giant',
  'shaking',
  'ground',
  'weather',
  'lesson',
  'almost',
  'square',
  'forward',
  'bend',
  'cold',
  'broken',
  'distant',
  'adjective'
]
function getRandomWord(firstLetterToUppercase = false) {
  const word = words[randomNumber(0, words.length - 1)]
  return firstLetterToUppercase ? word.charAt(0).toUpperCase() + word.slice(1) : word
}
function generateWords(length = 10) {
  return (
      [...Array(length)]
          .map((_, i) => getRandomWord(i === 0))
          .join(' ')
          .trim()
  )
}
function randomNumber(min: any, max: any) {
  return Math.round(Math.random() * (max - min) + min)
}