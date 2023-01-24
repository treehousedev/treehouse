
import { Environment } from "../../env/mod.ts";
import {Node} from "../../manifold/mod.ts";

interface Attrs {
  data: Node;
}

interface State {
  hover: boolean;
  // expanded: boolean;
  editing: boolean;
  buffer?: string;
}

export const OutlineNode: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    const node = attrs.data;
    const expanded = (node.Attrs["expanded"] !== undefined) ? JSON.parse(node.Attrs["expanded"]) : false; 
    const hover = (e) => {
      state.hover = true;
      e.stopPropagation();
    }
    const unhover = (e) => {
      state.hover = false;
      e.stopPropagation();
    }
    const toggle = (e) => {
      if (expanded) {
        env.commands.executeCommand("collapse", node);
      } else {
        env.commands.executeCommand("expand", node);
      }
      e.stopPropagation();
    }
    const startEdit = (e) => {
      env.workspace.currentNode = node;
      state.editing = true;
      state.buffer = node.Name;
    }
    const finishEdit = (e) => {
      state.editing = false;
      node.Name = state.buffer;
      state.buffer = undefined;
      env.workspace.currentNode = undefined;
    }
    const edit = (e) => {
      state.buffer = e.target.value;
    }
    return (
      <div class="" style={{paddingLeft: "1rem"}} onmouseover={hover} onmouseout={unhover}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "0.125rem",
          marginBottom: "0.125rem"
        }} >
          <svg xmlns="http://www.w3.org/2000/svg"
              style={{
                flexShrink: "0",
                width: "1rem", 
                height: "1rem", 
                position: "absolute", 
                marginLeft: "-1rem", 
                userSelect: "none",
                display: (state.hover)?"block":"none"
              }}  
              onclick={toggle}
              fill="gray" 
              viewBox="0 0 16 16">
            <circle cx="8" cy="7" r="7" fill="lightgray" />
            {!expanded && <path style={{transform: "scale(0.6) translate(5px, 3px)"}} d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>}
            {expanded && <path style={{transform: "scale(0.6) translate(5px, 4px)"}} d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>}
            
          </svg>
          <svg style={{flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(attrs.data.Linked.Children.length > 0)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
            <circle cx="8" cy="7" r="3"/>
          </svg>
          <div style={{flexGrow: "1", display: "flex"}}>
            <input type="text" value={(state.editing)?state.buffer:attrs.data.Name} 
              onfocus={startEdit}
              onblur={finishEdit}
              oninput={edit}
              style={{
                border: "0px",
                flexGrow: "1",
                outline: "0px"
              }} />
          </div>
        </div>
        <div style={{
          display: (expanded)?"flex":"none",
          flexDirection: "row",
          paddingBottom: "0.25rem"
        }}>
          <div style={{width: "1rem", marginRight: "0.25rem", display: "flex"}} onclick={toggle}>
            <div style={{borderLeft: "1px solid gray", height: "100%", marginLeft: "0.5rem"}}></div>
          </div>
          <div style={{flexGrow: "1"}}>{attrs.data.getChildren().map(n => <OutlineNode data={n} />)}</div>
        </div>
      </div>
    )
  }
};