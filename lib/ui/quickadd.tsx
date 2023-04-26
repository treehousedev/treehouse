import { OutlineEditor } from "./outline.tsx";

export const QuickAdd = {
  view({attrs: {workbench}}) {
    const panel = {
      id: "quickadd",
      headNode: workbench.quickadd
    }
    return (
      <div style={{
        position: "absolute", 
        left: "0", 
        right: "0", 
        top: "0", 
        bottom: "0",
      }}>
        
        <div onclick={() => workbench.closeQuickAdd()} style={{
          position: "absolute",
          background: "black",
          opacity: "50%",
          width: "100%",
          height: "100%"
        }}></div>
        
        <div class="notice" style={{
          position: "relative",
          marginLeft: "auto", 
          marginRight: "auto", 
          marginTop: "20vh", 
        }}>
          <h3>Quick Add</h3>
          <OutlineEditor workbench={workbench} node={workbench.quickadd} panel={panel} />
          <div class="button-bar">
            <button class="primary" onclick={() => {
              workbench.commitQuickAdd();
              workbench.closeQuickAdd();
            }}>Add to Today</button>
            
          </div>
        </div>
      </div>
    )
  }
}