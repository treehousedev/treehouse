import { LocalStorageStore } from "../../backend/mod.ts";
import { Environment } from "../../env/mod.ts";
import {OutlineNode} from "../outline/mod.tsx";
import {Node} from "../../manifold/mod.tsx";


window.env = new Environment(new LocalStorageStore());
env.commands.registerCommand({
  id: "expand",
  action: (n: Node) => {
    n.setAttr("expanded", JSON.stringify(true));
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "expand", key: "meta+arrowdown"});
env.commands.registerCommand({
  id: "collapse",
  action: (n: Node) => {
    n.setAttr("expanded", JSON.stringify(false));
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "collapse", key: "meta+arrowup"});
env.commands.registerCommand({
  id: "indent",
  action: (n: Node) => {
    const prev = n.getPrevSibling();
    if (prev !== null) {
      n.setParent(prev);
      prev.setAttr("expanded", JSON.stringify(true));
      m.redraw.sync();
      env.workspace.setCurrentNode(n);
    }
  }
});
env.keybindings.registerBinding({command: "indent", key: "tab"});
env.commands.registerCommand({
  id: "outdent",
  action: (n: Node) => {
    const parent = n.getParent();
    if (parent !== null && parent.ID !== "@root") {
      n.setParent(parent.getParent());
      n.setSiblingIndex(parent.getSiblingIndex()+1);
      m.redraw.sync();
      env.workspace.setCurrentNode(n);
    }
  }
});
env.keybindings.registerBinding({command: "outdent", key: "shift+tab"});
env.commands.registerCommand({
  id: "insert-child",
  action: (n: Node, name: string = "") => {
    const node = env.workspace.manifold.new(name);
    node.setParent(n);
    m.redraw.sync();
    env.workspace.setCurrentNode(node, name.length);
  }
});
env.commands.registerCommand({
  id: "insert-before",
  action: () => {
    const node = env.workspace.manifold.new("");
    node.setParent(env.workspace.currentNode.getParent());
    node.setSiblingIndex(env.workspace.currentNode.getSiblingIndex());
    m.redraw.sync();
    env.workspace.setCurrentNode(node);
  }
});
env.commands.registerCommand({
  id: "insert",
  action: (name: string = "") => {
    const node = env.workspace.manifold.new(name);
    node.setParent(env.workspace.currentNode.getParent());
    node.setSiblingIndex(env.workspace.currentNode.getSiblingIndex()+1);
    m.redraw.sync();
    env.workspace.setCurrentNode(node);
  }
});
env.keybindings.registerBinding({command: "insert", key: "shift+enter"});
env.commands.registerCommand({
  id: "delete",
  action: (n: Node) => {
    const prev = n.getPrevSibling();
    n.destroy();
    m.redraw.sync();
    if (prev) {
      env.workspace.setCurrentNode(prev);
    }
  }
});
env.keybindings.registerBinding({command: "delete", key: "shift+meta+backspace"});
env.commands.registerCommand({
  id: "prev",
  action: (n: Node) => {
    // TODO: find previous/above node in expanded prev sibling
    const prev = n.getPrevSibling();
    if (prev !== null) {
      env.workspace.setCurrentNode(prev);
    } else {
      env.workspace.setCurrentNode(n.getParent());
    }
  }
});
env.keybindings.registerBinding({command: "prev", key: "arrowup"});
env.commands.registerCommand({
  id: "next",
  action: (n: Node) => {
    // TODO: go into children if n is expanded
    const next = n.getNextSibling();
    if (next !== null) {
      env.workspace.setCurrentNode(next);
    } else {
      env.workspace.setCurrentNode(n.getParent().getNextSibling());
    }
  }
});
env.keybindings.registerBinding({command: "next", key: "arrowdown"});

document.addEventListener("keydown", (e) => {
  const binding = env.keybindings.evaluateEvent(e);
  if (binding && env.workspace.currentNode) {
    env.commands.executeCommand(binding.command, env.workspace.currentNode);
    e.stopPropagation();
    e.preventDefault();
  }
});

export const App: m.Component = {
  view (vnode) {
    return <main>
      {env.workspace.manifold.find("@root").getChildren().map(n => <OutlineNode key={n.ID} data={n} />)}
    </main>
  }
};