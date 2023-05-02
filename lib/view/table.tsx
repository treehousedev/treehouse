import { NodeEditor, TextEditor } from "../ui/node/editor.tsx";
import { OutlineNode } from "../ui/outline.tsx";

export default {
  view({attrs: {workbench, path}, state}) {
    const node = path.node;
    state.fields = (state.fields === undefined) ? new Set() : state.fields;
    node.children.forEach(n => {
      n.getLinked("Fields").forEach(f => state.fields.add(f.name));
    });
    const getFieldEditor = (node, field) => {
      const fields = node.getLinked("Fields").filter(f => f.name === field);
      if (fields.length === 0) return "";
      return <NodeEditor editValue={true} workbench={workbench} path={path.append(fields[0])} />
    }
    return (
      <table class="table-view" style={{gridTemplateColumns: `repeat(${state.fields.size+1}, 1fr)`}}>
        <thead>
          <tr>
            <th></th>
            {[...state.fields].map(f => <th>{f}</th>)}
          </tr>
        </thead>
        <tbody>
          {node.children.map(n => (
            <tr>
              <td><OutlineNode key={n.id} workbench={workbench} path={path.append(n)} /></td>
              {[...state.fields].map(f => <td>{getFieldEditor(n, f)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}