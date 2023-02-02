import { Workspace, panelNode } from "./workspace.ts";
import { App } from "./ui/app.tsx";
import { Workspace } from "./workspace.ts";
import { LocalStorageStore, Store } from "./backend.ts";
import { component } from "./manifold/components.ts";

export { LocalStorageStore };

@component
export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }
}

export function setup(document: Document, target: HTMLElement, store: Store) {
  const workspace = new Workspace(store);

  workspace.commands.registerCommand({
    id: "add-checkbox",
    title: "Add checkbox",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const checkbox = new Checkbox();
      ctx.node.addComponent(checkbox);
    }
  });

  workspace.commands.registerCommand({
    id: "remove-checkbox",
    title: "Remove checkbox",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      ctx.node.removeComponent(Checkbox);
    }
  });

  workspace.commands.registerCommand({
    id: "mark-done",
    title: "Mark done",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.node.hasComponent(Checkbox)) {
        const checkbox = ctx.node.getComponent(Checkbox);
        if (!checkbox.checked) {
          checkbox.checked = true;
          ctx.node.changed();
        } else {
          ctx.node.removeComponent(Checkbox);
        }
      } else {
        const checkbox = new Checkbox();
        ctx.node.addComponent(checkbox);
      }
    }
  });
  workspace.keybindings.registerBinding({command: "mark-done", key: "meta+enter" });



  workspace.commands.registerCommand({
    id: "expand",
    title: "Expand",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workspace.setExpanded(ctx.node, true);
      m.redraw();
    }
  });
  workspace.keybindings.registerBinding({command: "expand", key: "meta+arrowdown" });
  workspace.commands.registerCommand({
    id: "collapse",
    title: "Collapse",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workspace.setExpanded(ctx.node, false);
      m.redraw();
    }
  });
  workspace.keybindings.registerBinding({command: "collapse", key: "meta+arrowup" });
  workspace.commands.registerCommand({
    id: "indent",
    title: "Indent",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const prev = ctx.node.getPrevSibling();
      if (prev !== null) {
        ctx.node.setParent(prev);
        prev.setAttr("expanded", JSON.stringify(true));
        m.redraw.sync();
        workspace.focus(ctx.node);
      }
    }
  });
  workspace.keybindings.registerBinding({command: "indent", key: "tab"});
  workspace.commands.registerCommand({
    id: "outdent",
    title: "Outdent",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const parent = ctx.node.getParent();
      if (parent !== null && parent.ID !== "@root") {
        ctx.node.setParent(parent.getParent());
        ctx.node.setSiblingIndex(parent.getSiblingIndex()+1);
        m.redraw.sync();
        workspace.focus(ctx.node);
      }
    }
  });
  workspace.keybindings.registerBinding({command: "outdent", key: "shift+tab"});
  workspace.commands.registerCommand({
    id: "insert-child",
    title: "Insert Child",
    action: (ctx: Context, name: string = "") => {
      if (!ctx.node) return;
      const node = workspace.nodes.new(name);
      node.setParent(ctx.node);
      m.redraw.sync();
      workspace.focus(panelNode(node, ctx.node.panel), name.length);
    }
  });
  workspace.commands.registerCommand({
    id: "insert-before",
    title: "Insert Before",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const node = workspace.nodes.new("");
      node.setParent(ctx.node.getParent());
      node.setSiblingIndex(ctx.node.getSiblingIndex());
      m.redraw.sync();
      workspace.focus(panelNode(node, ctx.node.panel));
    }
  });
  workspace.commands.registerCommand({
    id: "insert",
    title: "Insert Node",
    action: (ctx: Context, name: string = "") => {
      if (!ctx.node) return;
      const node = workspace.nodes.new(name);
      node.setParent(ctx.node.getParent());
      node.setSiblingIndex(ctx.node.getSiblingIndex()+1);
      m.redraw.sync();
      workspace.focus(panelNode(node, ctx.node.panel));
    }
  });
  workspace.keybindings.registerBinding({command: "insert", key: "shift+enter"});
  workspace.commands.registerCommand({
    id: "delete",
    title: "Delete node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const prev = ctx.node.getPrevSibling();
      ctx.node.destroy();
      m.redraw.sync();
      if (prev) {
        workspace.focus(panelNode(prev, ctx.node.panel));
      }
    }
  });
  workspace.keybindings.registerBinding({command: "delete", key: "shift+meta+backspace" });
  workspace.commands.registerCommand({
    id: "prev",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      // TODO: find previous/above node in expanded prev sibling
      const prev = ctx.node.getPrevSibling();
      if (prev !== null) {
        workspace.focus(panelNode(prev, ctx.node.panel));
      } else {
        workspace.focus(panelNode(ctx.node.getParent(), ctx.node.panel));
      }
    }
  });
  workspace.keybindings.registerBinding({command: "prev", key: "arrowup"});
  workspace.commands.registerCommand({
    id: "next",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      // TODO: go into children if n is expanded
      const next = ctx.node.getNextSibling();
      if (next !== null) {
        workspace.focus(panelNode(next, ctx.node.panel));
      } else {
        return;
        //workspace.focus(panelNode(ctx.node.getParent().getNextSibling(), ctx.node.panel));
      }
    }
  });
  workspace.keybindings.registerBinding({command: "next", key: "arrowdown"});
  workspace.commands.registerCommand({
    id: "pick-command",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const trigger = workspace.getInput(ctx.node);
      const rect = trigger.getBoundingClientRect();
      const x = document.body.scrollLeft+rect.x+200;
      const y = document.body.scrollTop+rect.y;
      workspace.showPalette(x, y, workspace.newContext({node: ctx.node}));
    }
  });
  workspace.keybindings.registerBinding({command: "pick-command", key: "meta+k"});
  workspace.commands.registerCommand({
    id: "new-panel",
    title: "Open in New Panel",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workspace.openNewPanel(ctx.node);
      m.redraw();
    }
  });
  workspace.commands.registerCommand({
    id: "close-panel",
    title: "Close Panel",
    action: (ctx: Context, panel?: Panel) => {
      workspace.closePanel(panel || ctx.node.panel);
      m.redraw();
    }
  });
  workspace.commands.registerCommand({
    id: "zoom",
    title: "Zoom",
    action: (ctx: Context) => {
      ctx.node.panel.history.push(ctx.node);
      m.redraw();
    }
  });

  workspace.menus.registerMenu("node", [
    {command: "zoom"},
    {command: "new-panel"},
    {command: "indent"},
    {command: "outdent"},
    {command: "delete"},
    {command: "add-checkbox"}, // example when condition
    {command: "remove-checkbox"},
    {command: "mark-done"},
  ]);

  document.addEventListener("keydown", (e) => {
    const binding = workspace.keybindings.evaluateEvent(e);
    if (binding && workspace.context.node) {
      workspace.commands.executeCommand(binding.command, workspace.context);
      e.stopPropagation();
      e.preventDefault();
    }
  });

  document.addEventListener("click", (e) => {
    workspace.hideMenu();
  });


  m.mount(target, {view: () => m(App, {workspace})});
}