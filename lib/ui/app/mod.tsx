import { LocalStorageStore } from "../../backend/mod.ts";
import { Environment, Context } from "../../env/mod.ts";
import {OutlineNode} from "../outline/mod.tsx";
import {Node} from "../../manifold/mod.tsx";
import {Menu} from "../menu/mod.tsx";
import { CommandPalette } from "../palette/mod.tsx";

// Run this only once, it's unlikely the OS will change without a reload of the page
const osType = (() => {
  if (navigator.userAgent.toLowerCase().indexOf("win")   != -1) return "win";
  if (navigator.userAgent.toLowerCase().indexOf("mac")   != -1) return "mac";
  if (navigator.userAgent.toLowerCase().indexOf("linux") != -1) return "linux";
  if (navigator.userAgent.toLowerCase().indexOf("x11")   != -1) return "unix";
  return "unknown";
})();

// Returns an os-specific key from an object, the wildcard, or the first
// Allows to define configurations that differ based on the OS the page is viewed from
const osSpecific = function<T = unknown>(options: Record<string, T>): T {

  // Sanity checking
  const keys = Object.keys(options);
  if (keys.length <= 0) {
    throw new Error("Invalid options record object given, must contain at least one option");
  }

  // Return os-specific, fallback, or first, in that order of preference
  if (keys.includes(osType)) return options[osType];
  if (keys.includes("*")) return options["*"];
  return options[keys[0]];
};

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
env.keybindings.registerBinding({command: "expand", key: osSpecific({ "mac": "meta+arrowdown", "*": "ctrl+arrowdown" }) });
env.commands.registerCommand({
  id: "collapse",
  title: "Collapse",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    ctx.node.setAttr("expanded", JSON.stringify(false));
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "collapse", key: osSpecific({ "mac": "meta+arrowup", "*": "ctrl+arrowup" }) });
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
env.keybindings.registerBinding({command: "delete", key: osSpecific({ "mac": "shift+meta+backspace", "*": "shift+ctrl+backspace" }) });
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
env.commands.registerCommand({
  id: "pick-command",
  action: (ctx: Context) => {
    if (!ctx.node) return;
    const trigger = document.getElementById(`input-${ctx.node.ID}`);
    const rect = trigger.getBoundingClientRect();
    const x = document.body.scrollLeft+rect.x+200;
    const y = document.body.scrollTop+rect.y;
    env.workspace.showPalette(x, y, env.workspace.getContext({node: ctx.node}));
  }
});
env.keybindings.registerBinding({command: "pick-command", key: "meta+k"});

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
      {env.workspace.palette && <CommandPalette {...env.workspace.palette} />}
    </main>
  }
};
