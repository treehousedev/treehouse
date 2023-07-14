import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";
import { Workbench, Workspace } from "../workbench/mod.ts";
import { Path } from "../workbench/path.ts";
import { Template } from "./template.tsx";
import { Picker } from "../ui/picker.tsx";

@component
export class Tag {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  afterEditor() {
    return TagBadge;
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "add-tag",
      title: "Add tag",
      hidden: true,
      action: (ctx: Context, name: string) => {
        if (!ctx.node) return;
        const tag = new Tag(name);
        ctx.node.addComponent(tag);
        const tmpl = Template.findNode(workbench.workspace, name);
        if (tmpl) {
          tmpl.fields.map(f => f.duplicate()).forEach(f => {
            ctx.node.addLinked("Fields", f);
            f.raw.Parent = ctx.node.raw.ID;
          });
          tmpl.children.map(c => c.duplicate()).forEach(c => {
            ctx.node.addChild(c);
            c.raw.Parent = ctx.node.raw.ID;
          });
        }
        ctx.node.changed();
      }
    });
  }

  static findAll(ws: Workspace): string[] {
    const tags = new Set();
    ws.mainNode().walk((n) => {
      if (n.value instanceof Tag) {
        tags.add(n.value.name);
      }
      return false;
    }, {includeComponents: true});
    return [...tags];
  }

  static findTagged(ws: Workspace, name: string): Node[] {
    const nodes = [];
    ws.mainNode().walk((n) => {
      if (n.value instanceof Tag && n.value.name === name) {
        nodes.push(n.parent);
      }
      return false;
    }, {includeComponents: true});
    return nodes;
  }

  static showPopover(bench: Workbench, path: Path, node: Node, inputview: Function, closer: Function) {
    const tags = Tag.findAll(bench.workspace);
    const trigger = bench.getInput(path);
    const rect = trigger.getBoundingClientRect();
    let x = document.body.scrollLeft + rect.x + (trigger.selectionStart * 10) + 20;
    let y = document.body.scrollTop + rect.y + rect.height;
    bench.showPopover(() => (
      <Picker 
        onpick={(item) => {
          closer();
          bench.getInput(path).blur();
          node.name = node.name.replace(/\s*#\w*/, "");
          bench.executeCommand("add-tag", {node, path}, item.name);
        }}
        onchange={(state) => {
          if (node.name.includes("#")) {
            state.input = node.name.split("#")[1];
          } else {
            state.input = "";
          }
          const filtered = [...tags]
            .filter(t => t.toLowerCase().startsWith(state.input.toLowerCase()))
            .map(t => {return {name: t}});
          if ((filtered[0] && filtered[0].name != state.input && state.input != "") || filtered.length === 0) {
            filtered.unshift({name: state.input, prefix: "Create tag: "});
          }
          state.items = filtered;
        }}
        inputview={inputview}
        itemview={(item) => 
          <div class="flex">
            <div>{item.prefix||""}{item.name}</div>
          </div>
        }
      />
    ), {top: `${y}px`, left: `${x}px`});
  }
}

const TagBadge = {
  view({attrs: {node, component}}) {
    const onkeydown = (e) => {
      if (e.key === "Backspace") {
        node.removeComponent(component);
        node.changed();
      }
    };
    return (
      <div tabindex="1" class="badge flex flex-row items-center" onkeydown={onkeydown} >
        <span>#&nbsp;</span>
        <div style={{whiteSpace: "nowrap"}}>{component.name}</div>
      </div>
    )
  }
}