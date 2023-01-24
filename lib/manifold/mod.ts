
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
    this.module.notify(this.module.nodes[this.ID]);
  }

  get Name(): string {
    return this.module.nodes[this.ID].Name;
  }

  set Name(val: string) {
    this.module.nodes[this.ID].Name = val;
    this.changed();
  }

  get Value(): any {
    return this.module.nodes[this.ID].Value;
  }

  get Parent(): string|undefined {
    return this.module.nodes[this.ID].Parent;
  }

  get Linked(): {[index: string]: string[]} {
    return this.module.nodes[this.ID].Linked;
  }

  get Attrs(): {[index: string]: string} {
    return this.module.nodes[this.ID].Attrs;
  }

  getParent(): Node|undefined {
    if (!this.Parent) return undefined;
    return new Node(this.module, this.Parent);
  }
  
  getChildren(): Node[] {
    if (!this.Linked["Children"]) return [];
    return this.Linked["Children"].map(id => new Node(this.module, id));
  }
}


export class Module {
  nodes: {[index: string]: RawNode};
  observers: [(n: RawNode) => void];

  constructor() {
    this.nodes = {};
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

  roots(): Node[] {
    return Object.values(this.nodes).filter(n => n.Parent === undefined).map(n => new Node(this, n.ID));
  }

  notify(n: RawNode) {
    this.observers.forEach(cb => cb(n));
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