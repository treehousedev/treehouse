
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
      <div style={{paddingLeft: "1rem"}} onmouseover={hover} onmouseout={unhover}>
        <div style={{
          display: "flex",
          flexDirection: "row",
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
            {!state.expanded && <path style={{transform: "scale(0.8) translate(2px, 2px)"}} d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>}
            {state.expanded && <path style={{transform: "scale(0.8) translate(2px, 3px)"}} d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z"/>}
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          </svg>
          <svg style={{width: "1rem", height: "1rem", marginRight: "0.25rem"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(attrs.data.Linked.Children.length > 0)?<circle cx="8" cy="8" r="6" fill="lightgray" />:null}
            <circle cx="8" cy="8" r="3"/>
          </svg>
          <span>{attrs.data.Name}</span>
        </div>
        <div style={{
          display: (state.expanded)?"flex":"none",
          flexDirection: "row",
          paddingBottom: "0.25rem"
        }}>
          <div style={{width: "1rem", marginRight: "0.25rem"}} onclick={toggle}>
            <div style={{borderLeft: "1px solid gray", height: "100%", marginLeft: "0.5rem"}}></div>
          </div>
          <div style={{flexGrow: "1"}}>{attrs.data.Linked.Children.map(id => <Node nodes={attrs.nodes} data={attrs.nodes[id]} />)}</div>
        </div>
      </div>
    )
  }
};