import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class Document {
  object?: Node;

  constructor() {
  }

  onAttach(node: Node) {
    this.object = node.parent;
    this.object.setAttr("view", "document");
  }

  handleIcon(collapsed: boolean = false): any {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="node-bullet" >
        {/* {collapsed?<circle id="node-collapsed-handle" stroke="none" cx="12" cy="12" r="12"/>:null} */}
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    );
  }

  toJSON(key: string): any {
    return {};
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "make-document",
      title: "Make Document",
      action: (ctx: Context) => {
        if (!ctx.node) return;
        const doc = new Document();
        ctx.node.addComponent(doc);
        ctx.node.changed();
        workbench.executeCommand("zoom", ctx);
      }
    });
  }
}
