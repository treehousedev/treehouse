
import { Workbench, Node } from "../workbench.ts";

import { Checkbox } from "../mod.ts";

interface Attrs {
  node: Node;
  workbench: Workbench;
}

interface State {
  hover: boolean;
  // expanded: boolean;
  editing: boolean;
  buffer?: string;
}

export const OutlineNode: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    const {node, panel, workbench} = attrs;
    const expanded = workbench.workspace.getExpanded(panel.headNode, node); 
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
        workbench.executeCommand("collapse", {node, panel});
      } else {
        workbench.executeCommand("expand", {node, panel});
      }
      e.stopPropagation();
    }
    const checkCommands = (e) => {
      const anyModifiers = e.shiftKey || e.metaKey || e.altKey || e.ctrlKey;
      switch (e.key) {
      case "ArrowUp":
        if (e.target.selectionStart !== 0 && !anyModifiers) {
          e.stopPropagation()
        }
        break;
      case "ArrowDown":
        if (e.target.selectionStart !== e.target.value.length && e.target.selectionStart !== 0 && !anyModifiers) {
          e.stopPropagation()
        }
        break;
      case "Backspace":
        // cursor at beginning of empty text
        if (e.target.value === "") {
          e.preventDefault();
          e.stopPropagation();
          if (node.childCount > 0) {
            return;
          }
          workbench.executeCommand("delete", {node, panel, event: e});
          return;
        }
        // cursor at beginning of non-empty text
        if (e.target.value !== "" && e.target.selectionStart === 0 && e.target.selectionEnd === 0) {
          e.preventDefault();
          e.stopPropagation();
          
          // TODO: make this work as a command?
          const prev = workbench.workspace.findAbove(panel.headNode, node);
          if (!prev) {
            return;
          }
          const oldName = prev.name;
          prev.name = oldName+e.target.value;
          node.destroy();
          m.redraw.sync();
          workbench.focus(prev, panel, oldName.length);
          
          return;
        }
        break;
      case "Enter":
        e.preventDefault();
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;
        // cursor at end of text
        if (e.target.selectionStart === e.target.value.length) {
          if (node.childCount > 0 && workbench.workspace.getExpanded(panel.headNode, node)) {
            workbench.executeCommand("insert-child", {node, panel}, "", 0);
          } else {
            workbench.executeCommand("insert", {node, panel});
          }
          e.stopPropagation();
          return;
        }
        // cursor at beginning of text
        if (e.target.selectionStart === 0) {
          workbench.executeCommand("insert-before", {node, panel});
          e.stopPropagation();
          return;
        }
        // cursor in middle of text
        if (e.target.selectionStart > 0 && e.target.selectionStart < e.target.value.length) {
          workbench.executeCommand("insert", {node, panel}, e.target.value.slice(e.target.selectionStart)).then(() => {
            node.name = e.target.value.slice(0, e.target.selectionStart);
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
    const open = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      workbench.executeCommand("open", {node, panel});
      
      // clear text selection that happens after from double click
      if (document.selection && document.selection.empty) {
        document.selection.empty();
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    }
    return (
      <div onmouseover={hover} onmouseout={unhover}>
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
              onclick={(e) => workbench.showMenu(e, {node, panel})}
              oncontextmenu={(e) => workbench.showMenu(e, {node, panel})} 
              data-menu="node"
              fill="lightgray" 
              viewBox="0 0 16 16">
            <path style={{transform: "translateY(-1px)"}} fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
          </svg>
          <svg onclick={toggle} ondblclick={open} oncontextmenu={(e) => workbench.showMenu(e, {node, panel})} data-menu="node" style={{
              cursor: "pointer", 
              flexShrink: "0", 
              width: "1rem", 
              height: "1rem", 
              marginRight: "0.5rem", 
              paddingLeft: "1px",
              marginTop: "0.25rem"
            }} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(node.childCount > 0 && !expanded)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
            <circle cx="8" cy="7" r="3"/>
          </svg>
          <div style={{flexGrow: "1", display: "flex", alignItems: "start"}}>
            {(node.hasComponent(Checkbox)) ? <input type="checkbox" style={{marginTop: "0.3rem", marginRight: "0.5rem"}} onclick={toggleCheckbox} checked={node.getComponent(Checkbox).checked} />:null}
            <NodeEditor workbench={workbench} panel={panel} node={node} onkeydown={checkCommands} />
          </div>
        </div>
        {(expanded === true) &&
          <div style={{
            display: "flex",
            flexDirection: "row",
            paddingBottom: "0.25rem"
          }}>
            <div style={{width: "var(--8)", display: "flex"}} onclick={toggle}>
            </div>
            <div style={{flexGrow: "1"}}>
              {(node.childCount > 0)
                ?node.children.map(n => <OutlineNode key={n.id} workbench={workbench} panel={panel} node={n} />)
                :<NewNode workbench={workbench} panel={panel} node={node} />
              }
            </div>
          </div>
        }
      </div>
    )
  }
};

export const NewNode = {
  view({attrs: {workbench, panel, node}}) {
    const startNew = (e) => {
      workbench.executeCommand("insert-child", {node, panel}, e.target.value);
    }
    const tabNew = (e) => {
      if (e.key === "Tab") {
        e.stopPropagation();
        e.preventDefault();
        if (node.childCount > 0) {
          const lastchild = node.children[node.childCount-1];
          workbench.executeCommand("insert-child", {node: lastchild, panel});
        }
      }
    }
    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
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
  view ({attrs: {workbench, panel, node}, state}) {
    return (
      <div style={{color: "var(--gray-900)"}}>
        {node.children.map(n => <OutlineNode key={n.id} workbench={workbench} panel={panel} node={n} />)}
        <NewNode workbench={workbench} panel={panel} node={node} />
      </div>
    )
  }
}

export const NodeEditor: m.Component = {
  oncreate({dom}) {
    const textarea = dom.querySelector("textarea");
    const initialHeight = textarea.offsetHeight;
    const span = dom.querySelector("span");
    this.updateHeight = () => {
      span.style.width = `${Math.max(textarea.offsetWidth, 100)}px`;
      span.innerHTML = textarea.value.replace("\n", "<br/>");
      textarea.style.height = (span.offsetHeight > 0) ? `${span.offsetHeight}px` : `${initialHeight}px`;
    }
    textarea.addEventListener("input", () => this.updateHeight());
    textarea.addEventListener("blur", () => span.innerHTML = "");
    setTimeout(() => this.updateHeight(), 50);
  },
  onupdate() {
    this.updateHeight();
  },
  view ({attrs: {workbench, node, panel, onkeydown, disallowEmpty}, state}) {
    const value = (state.editing)?state.buffer:node.name;
    
    const defaultKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    const startEdit = (e) => {
      state.initialValue = node.name;
      workbench.context.node = node;
      state.editing = true;
      state.buffer = node.name;
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
            node.name = state.initialValue;
          } else {
            node.name = state.buffer;
          }
        }
        state.buffer = undefined;
        workbench.context.node = null;
      }
    }
    const edit = (e) => {
      state.buffer = e.target.value;
      if (disallowEmpty && state.buffer.length === 0) {
        node.name = state.initialValue;
      } else {
        node.name = state.buffer;
      }
    }
    
    const style = {
      outline: "none",
      color: "inherit",
      fontSize: "inherit",
      fontWeight: "inherit",
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
          id={`input-${panel.id}-${node.id}`}
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