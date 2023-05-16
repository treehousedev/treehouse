import { NewNode } from "../ui/node/new.tsx";
import { OutlineNode } from "../ui/outline.tsx";

export default {
  view({attrs: {workbench, path}}) {
    let node = path.node;
    if (path.node.refTo) {
      node = path.node.refTo;
    }
    return (
      <div class="list-view">
        <div class="fields">
          {(node.getLinked("Fields").length > 0) &&
            node.getLinked("Fields").map(n => <OutlineNode key={n.id} workbench={workbench} path={path.append(n)} />)
          }
        </div>
        <div class="children">
          {(node.childCount > 0)
            ?node.children.map(n => <OutlineNode key={n.id} workbench={workbench} path={path.append(n)} />)
            :<NewNode workbench={workbench} path={path} />
          }
        </div>
      </div>
    )
  }
}