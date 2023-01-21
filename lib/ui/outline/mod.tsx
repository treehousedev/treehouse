
import {Node as DataNode} from "../../manifold/mod.ts";

interface Attrs {
  data: DataNode;
  nodes: {[index: string]: DataNode};
}

interface State {
  hover: boolean;
  expanded: boolean;
}

export const Node: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    state.expanded = (state.expanded !== undefined) ? state.expanded : true;
    const hover = (e) => {
      state.hover = true;
      e.stopPropagation();
    }
    const unhover = (e) => {
      state.hover = false;
      e.stopPropagation();
    }
    const toggle = (e) => {
      if (state.expanded) {
        state.expanded = false;
      } else {
        state.expanded = true;
      }
      e.stopPropagation();
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
            {!state.expanded && <path style={{transform: "scale(0.6) translate(5px, 3px)"}} d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>}
            {state.expanded && <path style={{transform: "scale(0.6) translate(5px, 4px)"}} d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>}
            
          </svg>
          <svg style={{width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(attrs.data.Linked.Children.length > 0)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
            <circle cx="8" cy="7" r="3"/>
          </svg>
          <span>{attrs.data.Name}</span>
        </div>
        <div style={{
          display: (state.expanded)?"flex":"none",
          flexDirection: "row",
          paddingBottom: "0.25rem"
        }}>
          <div style={{width: "1rem", marginRight: "0.25rem", display: "flex"}} onclick={toggle}>
            <div style={{borderLeft: "1px solid gray", height: "100%", marginLeft: "0.5rem"}}></div>
          </div>
          <div style={{flexGrow: "1"}}>{attrs.data.Linked.Children.map(id => <Node nodes={attrs.nodes} data={attrs.nodes[id]} />)}</div>
        </div>
      </div>
    )
  }
};