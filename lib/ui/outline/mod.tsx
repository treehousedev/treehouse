
import { Node, panelNode } from "../../env/mod.ts";
import { Panel } from "../panel/mod.tsx";

interface Attrs {
  node: Node;
}

interface State {
  hover: boolean;
  // expanded: boolean;
  editing: boolean;
  buffer?: string;
}



export const OutlineNode: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    const {node} = attrs;
    const expanded = env.workspace.getExpanded(node); 
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
        env.workspace.executeCommand("collapse", {node});
      } else {
        env.workspace.executeCommand("expand", {node});
      }
      e.stopPropagation();
    }
    const startEdit = (e) => {
      env.workspace.context.node = node;
      state.editing = true;
      state.buffer = node.getName();
    }
    const finishEdit = (e) => {
      state.editing = false;
      if (!node.isDestroyed) {
        node.setName(state.buffer);
      }
      state.buffer = undefined;
      env.workspace.context.node = null;
    }
    const edit = (e) => {
      state.buffer = e.target.value;
    }
    const startNew = (e) => {
      env.workspace.executeCommand("insert-child", {node}, e.target.value);
      e.stopPropagation();
    }
    const showMenu = (e) => {
      const trigger = e.target.closest("*[data-menu]");
      const rect = trigger.getBoundingClientRect();
      const x = document.body.scrollLeft+rect.x;
      const y = document.body.scrollTop+rect.y+rect.height;
      env.workspace.showMenu(trigger.dataset["menu"], x, y, {node});
      e.preventDefault();
    }
    const checkCommands = (e) => {
      switch (e.key) {
      case "Backspace":
        if (e.target.value === "") {
          env.workspace.executeCommand("delete", {node});
          // TODO: put cursor at end of new currentNode
          e.stopPropagation();
          return;
        }
        if (e.target.value !== "" && e.target.selectionStart === 0) {
          // TODO: append current node text to previous, delete current node, set focus on prev node with cursor at end of old text
          console.log("TODO!");
          e.stopPropagation();
          return;
        }
        break;
      case "Enter":
        if (e.target.selectionStart === e.target.value.length) {
          env.workspace.executeCommand("insert", {node});
          e.stopPropagation();
          return;
        }
        if (e.target.selectionStart === 0) {
          env.workspace.executeCommand("insert-before", {node});
          e.stopPropagation();
          return;
        }
        if (e.target.selectionStart > 0 && e.target.selectionStart < e.target.value.length) {
          state.buffer = e.target.value.slice(0, e.target.selectionStart);
          env.workspace.executeCommand("insert", {node}, e.target.value.slice(e.target.selectionStart));
          e.stopPropagation();
          return;
        }
        break;
      }
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
          <svg oncontextmenu={showMenu} data-menu="node" style={{flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(node.getChildren().length > 0)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
            <circle cx="8" cy="7" r="3"/>
          </svg>
          <div style={{flexGrow: "1", display: "flex"}}>
            <input id={`input-${node.panel.id}-${node.ID}`} type="text" value={(state.editing)?state.buffer:node.getName()} 
              onfocus={startEdit}
              onblur={finishEdit}
              oninput={edit}
              onkeydown={checkCommands}
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
          <div style={{flexGrow: "1"}}>
            {(node.getChildren().length > 0)
              ?node.getChildren().map(n => <OutlineNode key={n.ID} node={panelNode(n, node.panel)} />)
              :<div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: "1rem",
                marginTop: "0.125rem",
                marginBottom: "0.125rem"
              }} >
                <svg style={{flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
                  <circle cx="8" cy="7" r="7" fill="lightgray" />
                  <path fill="#555" style={{transform: "translate(0px, -1px)"}} d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                <div style={{flexGrow: "1", display: "flex"}}>
                <input type="text"
                  oninput={startNew}
                  style={{
                    border: "0px",
                    flexGrow: "1",
                    outline: "0px"
                  }} />
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
};