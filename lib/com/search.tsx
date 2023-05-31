import { Workbench } from "../workbench/mod.ts";
import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

function debounce(func, timeout = 1000){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

@component
export class SearchNode {
  workbench: Workbench;
  component?: Node;
  object?: Node;
  results?: Node[];

  lastQuery?: string;
  lastResultCount?: number;

  constructor() {
    this.workbench = window.workbench;
    this.searchDebounce = debounce(this.search.bind(this));
  }

  handleIcon(collapsed: boolean = false): any {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="node-bullet" width="15" height="15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        {collapsed?<circle id="node-collapsed-handle" stroke="none" cx="12" cy="12" r="12"/>:null}
        <svg xmlns="http://www.w3.org/2000/svg" x="3" y="3" width="19" height="19" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </svg>
    );
  }

  handlePlaceholder(): any {
    return 'Enter search value';
  }

  displayName(node: Node): any {
    return node.name;
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
    if (!this.object) return;

    const query = this.object.name;
    const results = this.workbench.search(query)
      .filter(n => n.id !== this.object.id && n.id !== this.component.id);
    
    if (results.length !== this.lastResultCount || query !== this.lastQuery) {
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
      this.lastQuery = query;
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