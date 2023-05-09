import { NewNode } from "../ui/node/new.tsx";
import { OutlineNode } from "../ui/outline.tsx";

export default {
  view({ attrs: { workbench, path } }) {
    return (
      <div class="list-view">
        <div class="fields">
          {(path.node.getLinked("Fields").length > 0) &&
            path.node.getLinked("Fields").map(n => <OutlineNode key={n.id} workbench={workbench} path={path.append(n)} />)
          }
        </div>
        <div class="children">
          {(path.node.childCount > 0)
            ? path.node.children.map(n => <OutlineNode key={n.id} workbench={workbench} path={path.append(n)} />)
            : <NewNode workbench={workbench} path={path} />
          }
        </div>
      </div>
    )
  }
}