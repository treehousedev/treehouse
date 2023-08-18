import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";
import { objectManaged } from "../model/hooks.ts";

@component
export class Description {
  text: string;

  constructor() {
    this.text = "";
  }

  editor() {
    return DescriptionEditor;
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "add-description",
      title: "Add Description",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.path.previous && objectManaged(ctx.path.previous)) return false;
        if (ctx.node.hasComponent(Description)) return false;
        return true;
      },
      action: (ctx: Context, name: string) => {
        const desc = new Description();
        ctx.node.addComponent(desc);
        ctx.node.changed();
      }
    });
  }
}

const DescriptionEditor = {
  view({attrs: {node}}) {
    const oninput = (e) => {
      const desc = node.getComponent(Description);
      desc.text = e.target.value;
      node.changed();
    }
    const onblur = (e) => {
      const desc = node.getComponent(Description);
      if (desc.text === "") {
        node.removeComponent(Description);
      }
      node.changed();
    }

    return <input class="node-description" placeholder="Add Description" type="text" value={node.getComponent(Description).text} onblur={onblur} oninput={oninput} />
  }
}