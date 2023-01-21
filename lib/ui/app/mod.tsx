import {Node} from "../outline/mod.tsx";
import { generateNodeTree } from "../../manifold/mod.ts";

const nodes = generateNodeTree(1000);

export const App: m.Component = {
  view (vnode) {
    return <main>
      {Object.values(nodes).filter(n => n.Parent === undefined).map(n => <Node nodes={nodes} data={n} />)}
    </main>
  }
};