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
      <button class="badge flex flex-row items-center" onkeydown={onkeydown} style={{background: "gray", lineHeight: "var(--body-line-height)", paddingLeft: "0.25rem", paddingRight: "0.25rem", borderRadius: "4px", color: "white"}}>
        <svg style={{width: "1rem", height: "1rem", marginRight: "0.25rem"}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-tag"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
        <div style={{whiteSpace: "nowrap"}}>{component.name}</div>
      </button>
    )
  }
}