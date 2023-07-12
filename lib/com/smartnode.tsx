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
export class SmartNode {
  workbench: Workbench;
  component?: Node;
  object?: Node;
  results?: Node[];
  query: string;

  lastQuery?: string;
  lastResultCount?: number;
  initialSearch: boolean;

  constructor() {
    this.workbench = window.workbench;
    this.searchDebounce = debounce(this.search.bind(this));
    this.query = "";
    this.initialSearch = false;
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

  belowEditor() {
    return SmartFilter;
  }

  onAttach(node: Node) {
    this.component = node;
    this.object = node.parent;
    node.bus.observe((n: Node) => {
      if (!node.isDestroyed) {
        this.searchDebounce();
      }
    });
  }

  search() {
    if (!this.object) return;
    if (!this.query) {
      this.lastQuery = "";
      this.results = [];
      return;
    }
    this.initialSearch = true;

    const results = this.workbench.search(this.query)
      .filter(n => n.id !== this.object.id && n.id !== this.component.id);
    
    if (results.length !== this.lastResultCount || this.query !== this.lastQuery) {
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
      this.lastQuery = this.query;
      this.lastResultCount = results.length;
    }
  }

  objectChildren(node: Node, children: Node[]): Node[] {
    if (!this.results && this.query && !this.initialSearch) {
      this.search();
    }
    return this.results || [];
  }

  toJSON(key: string): any {
    return {
      query: this.query
    };
  }

  fromJSON(obj: any) {
    this.query = obj.query || "";
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "make-smart-node",
      title: "Make Smart Node",
      action: (ctx: Context) => {
        if (!ctx.node) return;
        if (ctx.node.childCount > 0) return;
        workbench.defocus();
        const search = new SmartNode();
        ctx.node.addComponent(search);
        workbench.workspace.setExpanded(ctx.path.head, ctx.node, true);
        if (ctx.node.name === "") {
          setTimeout(() => {
            // defocusing will overwrite this from buffer
            // without a delay
            ctx.node.name = "Unnamed Smart Node";
            m.redraw();
            document.querySelector(`#node-${ctx.path.id}-${ctx.node.id} input`).focus();
          }, 10);
        }
      }
    });
  }
}


const SmartFilter = {
  view({attrs: {node, component, expanded}}) {
    if (!expanded) return;

    const oninput = (e) => {
      component.query = e.target.value;
      component.search();
      node.changed();
    }
    return (
      <div class="expanded-node flex flex-row">
        <div class="indent flex"></div>
        <input type="text" class="grow" placeholder="Enter search" 
          value={component.query}
          oninput={oninput}
          style={{
            background: "inherit", 
            border: "1px solid var(--color-outline-secondary)", 
            outline: "0", 
            padding: "var(--1)",
            marginBottom: "var(--1)",
            borderRadius: "var(--border-radius)"
        }} />
      </div>
    )
  }
}