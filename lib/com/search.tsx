import { SearchIndex } from "../backend/mod.ts";
import { component } from "../manifold/components.ts";
import { Node } from "../manifold/mod.ts";

function debounce(func, timeout = 1000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

@component
export class SearchNode {
  index: SearchIndex;
  component?: Node;
  object?: Node;
  results?: Node[];

  lastQuery?: string;
  lastResultCount?: number;

  constructor() {
    this.index = window.workbench.backend.index;
    this.searchDebounce = debounce(this.search.bind(this));
  }

  handleIcon(): any {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
  }

  displayName(node: Node): any {
    return `Search for "${node.name}"`;
  }

  onAttach(node: Node) {
    this.component = node;
    this.object = node.parent;
    node.bus.observe((n: Node) => {
      if (!node.isDestroyed) {
        this.searchDebounce();
      }
    })
  }

  search() {
    console.log("searched");
    if (!this.object) return;
    const results = this.index.search(this.object.name)
      .map(id => {
        let node = window.workbench.workspace.find(id);
        if (!node) {
          return undefined;
        }
        // if component value, get the parent
        if (node.value) {
          node = node.parent;
          // parent might not actually exist
          if (!node.raw) return;
        }
        return node;
      })
      .filter(n => n !== undefined)
      .filter(n => n.id !== this.object.id && n.id !== this.component.id);
    if (results.length !== this.lastResultCount || this.object.name !== this.lastQuery) {
      if (this.results) {
        // clean up old results
        this.results.forEach((n) => n.destroy());
      }
      this.results = results.map(n => {
        const ref = this.object.bus.make("");
        ref.raw.Parent = "@tmp"; // cleaned up next import
        ref.refTo = n;
        return ref;
      });
      this.lastQuery = this.object.name;
      this.lastResultCount = results.length;
    }
  }

  objectChildren(node: Node, children: Node[]): Node[] {
    if (!this.results) this.search();
    return this.results;
  }

  toJSON(key: string): any {
    return {};
  }

  fromJSON(obj: any) {
    //console.log("fromJson");
  }
}