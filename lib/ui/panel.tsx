import {OutlineNode} from "./outline.tsx";
import {panelNode} from "../workspace.ts";

export const Panel = {
  view({attrs}) {
    const panel = attrs.panel;
    const workspace = attrs.workspace;
    const node = panel.history[panel.history.length - 1];

    const close = (e) => {
      workspace.executeCommand("close-panel", {}, panel);
    }
    const goBack = (e) => {
      panel.history.pop();
    }
    
    return <div style={{flexGrow: "1", margin: "0.5rem"}}>
      <div style={{display: "flex"}}>
        {(panel.history.length>1)?<button onclick={goBack}>&lt;</button>:null}
        <div style={{flexGrow: "1"}}>{node.getName()}</div>
        {(workspace.panels[0].length>1)?<button onclick={close}>x</button>:null}
      </div>
      <div>
        {node.getChildren().map(n => <OutlineNode key={n.ID} workspace={workspace} node={panelNode(n, node.panel)} />)}
      </div>
    </div>
  }
};