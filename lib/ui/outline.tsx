
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
    const checkCommands = (e) => {
      switch (e.key) {
      case "ArrowUp":
        if (e.target.selectionStart !== 0) {
          e.stopPropagation()
        }
        break;
      case "ArrowDown":
        if (e.target.selectionStart !== e.target.value.length && e.target.selectionStart !== 0) {
          e.stopPropagation()
        }
        break;
      case "Backspace":
        // cursor at beginning of empty text
        if (e.target.value === "") {
          e.preventDefault();
          e.stopPropagation();
          workspace.executeCommand("delete", {node, event: e});
          return;
        }
        // cursor at beginning of non-empty text
        if (e.target.value !== "" && e.target.selectionStart === 0 && e.target.selectionEnd === 0) {
          e.preventDefault();
          e.stopPropagation();
          
          // TODO: make this work as a command?
          const prev = workspace.findAbove(node);
          if (!prev) {
            return;
          }
          const oldName = prev.getName();
          prev.setName(oldName+e.target.value);
          node.destroy();
          m.redraw.sync();
          workspace.focus(panelNode(prev, node.panel), oldName.length);
          
          return;
        }
        break;
      case "Enter":
        e.preventDefault();
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;
        // cursor at end of text
        if (e.target.selectionStart === e.target.value.length) {
          workspace.executeCommand("insert", {node});
          e.stopPropagation();
          return;
        }
        // cursor at beginning of text
        if (e.target.selectionStart === 0) {
          workspace.executeCommand("insert-before", {node});
          e.stopPropagation();
          return;
        }
        // cursor in middle of text
        if (e.target.selectionStart > 0 && e.target.selectionStart < e.target.value.length) {
          workspace.executeCommand("insert", {node}, e.target.value.slice(e.target.selectionStart)).then(() => {
            node.setName(e.target.value.slice(0, e.target.selectionStart));
          });
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
    const zoom = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      workspace.executeCommand("zoom", {node});
      
      // clear text selection that happens after from double click
      if (document.selection && document.selection.empty) {
        document.selection.empty();
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    }
    return (
      <div style={{paddingLeft: "1rem"}} onmouseover={hover} onmouseout={unhover}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "start",
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
                marginTop: "0.25rem",
                display: (state.hover)?"block":"none"
              }}  
              onclick={(e) => workspace.showMenu(e, {node})}
              oncontextmenu={(e) => workspace.showMenu(e, {node})} 
              data-menu="node"
              fill="lightgray" 
              viewBox="0 0 16 16">
            <path style={{transform: "translateY(-1px)"}} fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
          </svg>
          <svg onclick={toggle} ondblclick={zoom} oncontextmenu={(e) => workspace.showMenu(e, {node})} data-menu="node" style={{
              cursor: "pointer", 
              flexShrink: "0", 
              width: "1rem", 
              height: "1rem", 
              marginRight: "0.5rem", 
              paddingLeft: "1px",
              marginTop: "0.25rem"
            }} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(node.childCount() > 0 && !expanded)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
            <circle cx="8" cy="7" r="3"/>
          </svg>
          <div style={{flexGrow: "1", display: "flex", alignItems: "start"}}>
            {(node.hasComponent(Checkbox)) ? <input type="checkbox" style={{marginTop: "0.3rem", marginRight: "0.5rem"}} onclick={toggleCheckbox} checked={node.getComponent(Checkbox).checked} />:null}
            <NodeEditor workspace={workspace} node={node} onkeydown={checkCommands} />
          </div>
        </div>
        {(expanded === true) &&
          <div style={{
            display: "flex",
            flexDirection: "row",
            paddingBottom: "0.25rem"
          }}>
            <div style={{width: "1rem", marginRight: "0.25rem", display: "flex"}} onclick={toggle}>
              <div style={{borderLeft: "1px solid gray", height: "100%", marginLeft: "0.5rem"}}></div>
            </div>
            <div style={{flexGrow: "1"}}>
              {(node.childCount() > 0)
                ?node.getChildren().map(n => <OutlineNode key={n.ID} workspace={workspace} node={panelNode(n, node.panel)} />)
                :<NewNode workspace={workspace} node={node} />
              }
            </div>
          </div>
        }
      </div>
    )
  }
};

export const NewNode = {
  view({attrs: {workspace, node}}) {
    const startNew = (e) => {
      workspace.executeCommand("insert-child", {node}, e.target.value);
    }
    const tabNew = (e) => {
      if (e.key === "Tab") {
        e.stopPropagation();
        e.preventDefault();
        if (node.childCount() > 0) {
          const lastchild = node.getChildren()[node.childCount()-1];
          workspace.executeCommand("insert-child", {node: panelNode(lastchild, node.panel)});
        }
      }
    }
    return (
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
          onkeydown={tabNew}
          value={""}
          style={{
            border: "0px",
            flexGrow: "1",
            outline: "0px"
          }} />
        </div>
      </div>
    )
  }
}

export const OutlineEditor: m.Component<Attrs> = {
  view ({attrs: {workspace, node}, state}) {
    return (
      <div style={{padding: "var(--padding)"}}>
        {node.getChildren().map(n => <OutlineNode key={n.ID} workspace={workspace} node={panelNode(n, node.panel)} />)}
        <NewNode workspace={workspace} node={node} />
      </div>
    )
  }
}

export const NodeEditor: m.Component = {
  oncreate({dom}) {
    const textarea = dom.querySelector("textarea");
    const initialHeight = textarea.offsetHeight;
    const span = dom.querySelector("span");
    const updateHeight = () => {
      span.style.width = `${Math.max(textarea.offsetWidth, 100)}px`;
      span.innerHTML = textarea.value.replace("\n", "<br/>");
      textarea.style.height = (span.offsetHeight > 0) ? `${span.offsetHeight}px` : `${initialHeight}px`;
    }
    textarea.addEventListener("input", () => updateHeight());
    textarea.addEventListener("blur", () => span.innerHTML = "");
    setTimeout(() => updateHeight(), 50);
  },
  view ({attrs: {workspace, node, onkeydown, disallowEmpty}, state}) {
    const value = (state.editing)?state.buffer:node.getName();
    
    const defaultKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    const startEdit = (e) => {
      state.initialValue = node.getName();
      workspace.context.node = node;
      state.editing = true;
      state.buffer = node.getName();
    }
    const finishEdit = (e) => {
      // safari can trigger blur more than once
      // for a given element, namely when clicking
      // into devtools. this prevents the second 
      // blur setting node name to undefined/empty.
      if (state.editing) {
        state.editing = false;
        if (!node.isDestroyed) {
          if (disallowEmpty && state.buffer.length === 0) {
            node.setName(state.initialValue);
          } else {
            node.setName(state.buffer);
          }
        }
        state.buffer = undefined;
        workspace.context.node = null;
      }
    }
    const edit = (e) => {
      state.buffer = e.target.value;
      if (disallowEmpty && state.buffer.length === 0) {
        node.setName(state.initialValue);
      } else {
        node.setName(state.buffer);
      }
    }
    
    const style = {
      outline: "none",
      fontSize: "inherit",
      fontFamily: "inherit",
      padding: "0",
      width: "100%",
      boxSizing: "border-box",
      resize: "none",
      overflow: "hidden",
      display: "block",
      lineHeight: "1.45",
      border: "none"
    }
    return (
      <div style={{width: "100%", marginBottom: "0.5rem"}}>
        <textarea style={style} 
          id={`input-${node.panel?.id}-${node.ID}`}
          rows="1"
          onfocus={startEdit}
          onblur={finishEdit}
          oninput={edit}
          onkeydown={onkeydown||defaultKeydown}
          value={value}>{value}</textarea>
        <span style={Object.assign({visibility: "hidden", position: "fixed"}, style)}></span>
      </div>
    )
  }
}