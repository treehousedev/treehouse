import { LocalStorageStore } from "../backend.ts";
import { Environment, Context, panelNode } from "../workspace.ts";
import { Menu } from "./menu.tsx";
import { CommandPalette } from "./palette.tsx";
import { Panel as PanelComponent } from "./panel.tsx";


window.env = new Environment(new LocalStorageStore());
env.commands.registerCommand({
  id: "expand",
  title: "Expand",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    env.workspace.setExpanded(ctx.node, true);
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "expand", key: "meta+arrowdown" });
env.commands.registerCommand({
  id: "collapse",
  title: "Collapse",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    env.workspace.setExpanded(ctx.node, false);
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "collapse", key: "meta+arrowup" });
env.commands.registerCommand({
  id: "indent",
  title: "Indent",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    const prev = ctx.node.getPrevSibling();
    if (prev !== null) {
      ctx.node.setParent(prev);
      prev.setAttr("expanded", JSON.stringify(true));
      m.redraw.sync();
      env.workspace.focus(ctx.node);
    }
  }
});
env.keybindings.registerBinding({command: "indent", key: "tab"});
env.commands.registerCommand({
  id: "outdent",
  title: "Outdent",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    const parent = ctx.node.getParent();
    if (parent !== null && parent.ID !== "@root") {
      ctx.node.setParent(parent.getParent());
      ctx.node.setSiblingIndex(parent.getSiblingIndex()+1);
      m.redraw.sync();
      env.workspace.focus(ctx.node);
    }
  }
});
env.keybindings.registerBinding({command: "outdent", key: "shift+tab"});
env.commands.registerCommand({
  id: "insert-child",
  title: "Insert Child",
  action: (ctx: Context, name: string = "") => {
    if (!ctx.node) return;
    const node = env.workspace.manifold.new(name);
    node.setParent(ctx.node);
    m.redraw.sync();
    env.workspace.focus(ctx.node, name.length);
  }
});
env.commands.registerCommand({
  id: "insert-before",
  title: "Insert Before",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    const node = env.workspace.manifold.new("");
    node.setParent(ctx.node.getParent());
    node.setSiblingIndex(ctx.node.getSiblingIndex());
    m.redraw.sync();
    env.workspace.focus(panelNode(node, ctx.node.panel));
  }
});
env.commands.registerCommand({
  id: "insert",
  title: "Insert Node",
  action: (ctx: Context, name: string = "") => {
    if (!ctx.node) return;
    const node = env.workspace.manifold.new(name);
    node.setParent(ctx.node.getParent());
    node.setSiblingIndex(ctx.node.getSiblingIndex()+1);
    m.redraw.sync();
    env.workspace.focus(panelNode(node, ctx.node.panel));
  }
});
env.keybindings.registerBinding({command: "insert", key: "shift+enter"});
env.commands.registerCommand({
  id: "delete",
  title: "Delete node",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    const prev = ctx.node.getPrevSibling();
    ctx.node.destroy();
    m.redraw.sync();
    if (prev) {
      env.workspace.focus(panelNode(prev, ctx.node.panel));
    }
  }
});
env.keybindings.registerBinding({command: "delete", key: "shift+meta+backspace" });
env.commands.registerCommand({
  id: "prev",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    // TODO: find previous/above node in expanded prev sibling
    const prev = ctx.node.getPrevSibling();
    if (prev !== null) {
      env.workspace.focus(panelNode(prev, ctx.node.panel));
    } else {
      env.workspace.focus(panelNode(ctx.node.getParent(), ctx.node.panel));
    }
  }
});
env.keybindings.registerBinding({command: "prev", key: "arrowup"});
env.commands.registerCommand({
  id: "next",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    // TODO: go into children if n is expanded
    const next = ctx.node.getNextSibling();
    if (next !== null) {
      env.workspace.focus(panelNode(next, ctx.node.panel));
    } else {
      env.workspace.focus(panelNode(ctx.node.getParent().getNextSibling(), ctx.node.panel));
    }
  }
});
env.keybindings.registerBinding({command: "next", key: "arrowdown"});
env.commands.registerCommand({
  id: "pick-command",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    const trigger = env.workspace.getInput(ctx.node);
    const rect = trigger.getBoundingClientRect();
    const x = document.body.scrollLeft+rect.x+200;
    const y = document.body.scrollTop+rect.y;
    env.workspace.showPalette(x, y, env.workspace.newContext({node: ctx.node}));
  }
});
env.keybindings.registerBinding({command: "pick-command", key: "meta+k"});
env.commands.registerCommand({
  id: "new-panel",
  title: "Open in New Panel",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    env.workspace.openNewPanel(ctx.node);
    m.redraw();
  }
});
env.commands.registerCommand({
  id: "close-panel",
  title: "Close Panel",
  action: (ctx: Context, panel?: Panel) => {
    env.workspace.closePanel(panel || ctx.node.panel);
    m.redraw();
  }
});
env.commands.registerCommand({
  id: "zoom",
  title: "Zoom",
  action: (ctx: Context) => {
    ctx.node.panel.history.push(ctx.node);
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "zoom", key: "ctrl+z"});

env.menus.registerMenu("node", [
  {command: "zoom"},
  {command: "new-panel"},
  {command: "indent"},
  {command: "outdent"},
  {command: "delete"},
]);

document.addEventListener("keydown", (e) => {
  const binding = env.keybindings.evaluateEvent(e);
  if (binding && env.workspace.context.node) {
    env.commands.executeCommand(binding.command, env.workspace.context);
    e.stopPropagation();
    e.preventDefault();
  }
});

document.addEventListener("click", (e) => {
  env.workspace.hideMenu();
});

export const App: m.Component = {
  view (vnode) {
    const reset = (e) => {
      localStorage.clear();
      location.reload();
    };
    return <main>
      <button onclick={reset}>Reset</button>
      {env.workspace.panels.map(row => (
        <div style={{display: "flex"}}>{row.map(panel => <PanelComponent panel={panel} />)}</div>
      ))}
      
      {env.workspace.menu && <Menu {...env.workspace.menu} />}
      {env.workspace.palette && <CommandPalette {...env.workspace.palette} />}
    </main>
  }
};
