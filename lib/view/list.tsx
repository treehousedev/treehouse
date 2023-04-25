import { NewNode } from "../ui/node/new.tsx";
import { OutlineNode } from "../ui/outline.tsx";

export default {
  view({attrs: {node, workbench, panel}}) {
    return (
      <div class="list-view">
        <div class="fields">
          {(node.getLinked("Fields").length > 0) &&
            node.getLinked("Fields").map(n => <OutlineNode key={n.id} workbench={workbench} panel={panel} node={n} />)
          }
        </div>
        <div class="children">
          {(node.childCount > 0)
            ?node.children.map(n => <OutlineNode key={n.id} workbench={workbench} panel={panel} node={n} />)
            :<NewNode workbench={workbench} panel={panel} node={node} />
          }
        </div>
      </div>
    )
  }
}