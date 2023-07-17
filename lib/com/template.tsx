import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class Template {
  object?: Node;

  constructor() {
  }

  onAttach(node: Node) {
    this.object = node.parent;
  }

  handleIcon(collapsed: boolean = false): any {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="node-bullet" >
        {collapsed?<circle id="node-collapsed-handle" stroke="none" cx="12" cy="12" r="12"/>:null}
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    );
  }

  toJSON(key: string): any {
    return {};
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "make-template",
      title: "Make Template",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.node.raw.Rel === "Fields") return false;
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
        return true;
      },
      action: (ctx: Context) => {
        const tmpl = new Template();
        ctx.node.addComponent(tmpl);
        ctx.node.changed();
      }
    });
  }

  static findNode(ws: Workspace, name: string): Node|null {
    let node = null;
    ws.mainNode().walk((n) => {
      if (n.value instanceof Template && n.value.object.name === name) {
        node = n.value.object;
        return true;
      }
      return false;
    }, {includeComponents: true});
    return node;
  }
}
