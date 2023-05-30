import { OutlineEditor } from "./outline.tsx";
import { Path } from "../workbench/mod.ts";

export const QuickAdd = {
  view({attrs: {workbench, node}}) {
    const path = new Path(node, "quickadd");
    return (
      <div class="notice">
          <h3>Quick Add</h3>
          <OutlineEditor workbench={workbench} path={path} />
          <div class="button-bar">
            <button class="primary" onclick={() => {
              workbench.commitQuickAdd();
              workbench.closeDialog();
            }}>Add to Today</button>
            
          </div>
      </div>
    )
  }
}