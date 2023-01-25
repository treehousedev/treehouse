import { LocalStorageStore } from "../../backend/mod.ts";
import { Environment, Context } from "../../env/mod.ts";
import {OutlineNode} from "../outline/mod.tsx";
import {Node} from "../../manifold/mod.tsx";
import {Menu} from "../menu/mod.tsx";


window.env = new Environment(new LocalStorageStore());
env.commands.registerCommand({
  id: "expand",
  title: "Expand",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    ctx.node.setAttr("expanded", JSON.stringify(true));
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "expand", key: "meta+arrowdown"});
env.commands.registerCommand({
  id: "collapse",
  title: "Collapse",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    ctx.node.setAttr("expanded", JSON.stringify(false));
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "collapse", key: "meta+arrowup"});
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
      env.workspace.setCurrentNode(ctx.node);
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
      env.workspace.setCurrentNode(ctx.node);
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
    env.workspace.setCurrentNode(node, name.length);
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
    env.workspace.setCurrentNode(node);
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
    env.workspace.setCurrentNode(node);
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
      env.workspace.setCurrentNode(prev);
    }
  }
});
env.keybindings.registerBinding({command: "delete", key: "shift+meta+backspace"});
env.commands.registerCommand({
  id: "prev",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    // TODO: find previous/above node in expanded prev sibling
    const prev = ctx.node.getPrevSibling();
    if (prev !== null) {
      env.workspace.setCurrentNode(prev);
    } else {
      env.workspace.setCurrentNode(ctx.node.getParent());
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
      env.workspace.setCurrentNode(next);
    } else {
      env.workspace.setCurrentNode(ctx.node.getParent().getNextSibling());
    }
  }
});
env.keybindings.registerBinding({command: "next", key: "arrowdown"});

env.menus.registerMenu("node", [
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
      {env.workspace.manifold.find("@root").getChildren().map(n => <OutlineNode key={n.ID} data={n} />)}
      {env.workspace.menu && <Menu {...env.workspace.menu} />}
    </main>
  }
};