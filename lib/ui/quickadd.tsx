import { OutlineEditor } from "./outline.tsx";

export const QuickAdd = {
  view({attrs: {workspace}}) {
    return (
      <div style={{
        position: "absolute", 
        left: "0", 
        right: "0", 
        top: "0", 
        bottom: "0",
      }}>
        
        <div onclick={() => workspace.closeQuickAdd()} style={{
          position: "absolute",
          background: "black",
          opacity: "50%",
          width: "100%",
          height: "100%"
        }}></div>
        
        <div style={{
          position: "relative",
          marginLeft: "auto", 
          marginRight: "auto", 
          width: "45vw",
          borderRadius: "0.5rem",
          filter: "drop-shadow(2px 2px 4px #5555)",
          marginTop: "20vh", 
          padding: "2rem",
          background: "white"
        }}>
          <h3 style={{margin: "0"}}>Quick Add</h3>
          <hr />
          <OutlineEditor workspace={workspace} node={workspace.quickadd} />
          <hr />
          <div style={{textAlign: "right"}}>
            <button style={{padding: "0.5rem", margin: "0.25rem"}} onclick={() => {
              workspace.commitQuickAdd();
              workspace.closeQuickAdd();
            }}>Add to Today</button>
            
          </div>
        </div>
      </div>
    )
  }
}