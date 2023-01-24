import { LocalStorageStore } from "../../backend/mod.ts";
import { Environment } from "../../env/mod.ts";
import {OutlineNode} from "../outline/mod.tsx";
import {Node} from "../../manifold/mod.tsx";


window.env = new Environment(new LocalStorageStore());
env.commands.registerCommand({
  id: "expand",
  action: (n: Node) => {
    n.Attrs["expanded"] = JSON.stringify(true);
    n.changed();
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "expand", key: "meta+arrowdown"});
env.commands.registerCommand({
  id: "collapse",
  action: (n: Node) => {
    n.Attrs["expanded"] = JSON.stringify(false);
    n.changed();
    m.redraw();
  }
});
env.keybindings.registerBinding({command: "collapse", key: "meta+arrowup"});

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
      {env.workspace.manifold.roots().map(n => <OutlineNode data={n} />)}
    </main>
  }
};