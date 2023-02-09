
import { Workspace, Node, panelNode } from "../workspace.ts";

import { Checkbox } from "../mod.ts";

interface Attrs {
  node: Node;
  workspace: Workspace;
}

interface State {
  hover: boolean;
  // expanded: boolean;
  editing: boolean;
  buffer?: string;
}

export const OutlineNode: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    const {node, workspace} = attrs;
    const expanded = workspace.getExpanded(node); 
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
        workspace.executeCommand("collapse", {node});
      } else {
        workspace.executeCommand("expand", {node});
      }
      e.stopPropagation();
    }
    const startEdit = (e) => {
      workspace.context.node = node;
      state.editing = true;
      state.buffer = node.getName();
    }
    const finishEdit = (e) => {
      state.editing = false;
      if (!node.isDestroyed) {
        node.setName(state.buffer);
      }
      state.buffer = undefined;
      workspace.context.node = null;
    }
    const edit = (e) => {
      state.buffer = e.target.value;
      node.setName(state.buffer);
    }
    const startNew = (e) => {
      workspace.executeCommand("insert-child", {node}, e.target.value);
      e.stopPropagation();
    }
    const checkCommands = (e) => {
      switch (e.key) {
      case "Backspace":
        if (e.target.value === "") {
          workspace.executeCommand("delete", {node});
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
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;
        if (e.target.selectionStart === e.target.value.length) {
          workspace.executeCommand("insert", {node});
          e.stopPropagation();
          return;
        }
        if (e.target.selectionStart === 0) {
          workspace.executeCommand("insert-before", {node});
          e.stopPropagation();
          return;
        }
        if (e.target.selectionStart > 0 && e.target.selectionStart < e.target.value.length) {
          state.buffer = e.target.value.slice(0, e.target.selectionStart);
          workspace.executeCommand("insert", {node}, e.target.value.slice(e.target.selectionStart));
          e.stopPropagation();
          return;
        }
        break;
      }
    }
    const toggleCheckbox = (e) => {
      const checkbox = node.getComponent(Checkbox);
      checkbox.checked = !checkbox.checked;
      node.changed();
    }
    return (
      <div style={{paddingLeft: "1rem"}} onmouseover={hover} onmouseout={unhover}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: "0.125rem",
          marginBottom: "0.125rem"
        }} >
          <svg xmlns="http://www.w3.org/2000/svg"
              style={{
                cursor: "pointer",
                flexShrink: "0",
                width: "1rem", 
                height: "1rem", 
                position: "absolute", 
                marginLeft: "-1rem", 
                userSelect: "none",
                display: (state.hover)?"block":"none"
              }}  
              onclick={(e) => workspace.showMenu(e, {node})}
              oncontextmenu={(e) => workspace.showMenu(e, {node})} 
              data-menu="node"
              fill="lightgray" 
              viewBox="0 0 16 16">
            <path style={{transform: "translateY(-1px)"}} fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
          </svg>
          <svg onclick={toggle} oncontextmenu={(e) => workspace.showMenu(e, {node})} data-menu="node" style={{cursor: "pointer", flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(node.childCount() > 0 && !expanded)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
            <circle cx="8" cy="7" r="3"/>
          </svg>
          <div style={{flexGrow: "1", display: "flex"}}>
            {(node.hasComponent(Checkbox)) ? <input type="checkbox" onclick={toggleCheckbox} checked={node.getComponent(Checkbox).checked} />:null}
            <input id={`input-${node.panel?.id}-${node.ID}`} type="text" value={(state.editing)?state.buffer:node.getName()} 
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
            {(node.childCount() > 0)
              ?node.getChildren().map(n => <OutlineNode key={n.ID} workspace={workspace} node={panelNode(n, node.panel)} />)
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


export const OutlineEditor: m.Component<Attrs> = {
  view ({attrs, state}) {
    const node = attrs.node;
    const workspace = attrs.workspace;

    const startNew = (e) => {
      workspace.executeCommand("insert-child", {node}, e.target.value);
      e.stopPropagation();
    }

    return (
      <div style={{padding: "var(--padding)"}}>
        {node.getChildren().map(n => <OutlineNode key={n.ID} workspace={workspace} node={panelNode(n, node.panel)} />)}
        <div style={{
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
                  value={""}
                  style={{
                    border: "0px",
                    flexGrow: "1",
                    outline: "0px"
                  }} />
                </div>
              </div>
      </div>
    )
  }
}