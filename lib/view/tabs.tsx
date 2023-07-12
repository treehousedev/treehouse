import { OutlineNode } from "../ui/outline.tsx";

export default {
  view({ attrs: { workbench, path }, state }) {
    const node = path.node;
    state.tabName = '';
    state.fields = (state.fields === undefined) ? new Set() : state.fields;
    node.children.forEach(n => {
      n.getLinked("Fields").forEach(f => state.fields.add(f.name));
    });
    return (
      <div class="tabs-view">
        <ul class="tabs">
          {[...state.fields].map(f => <li onclick={() => state.tabName = f}>{f}</li>)}
        </ul>
        <div class="tab-content">
          {node.children.filter(n => n.getLinked("Fields").filter(f => f.name === state.tabName)).map(n => (
            <OutlineNode key={n.id} workbench={workbench} path={path.append(n)} />
          ))}
        </div>
        )
  }
}
