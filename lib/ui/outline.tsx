
import { Workbench, Node } from "../workbench.ts";

import { Checkbox } from "../com/checkbox.tsx";
import { objectCall, objectHas } from "../manifold/hooks.ts";

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

export const OutlineEditor: m.Component<Attrs> = {
  view ({attrs: {workbench, panel, node}, state}) {
    return (
      <div>
        {node.children.map(n => <OutlineNode key={n.id} workbench={workbench} panel={panel} node={n} />)}
        <NewNode workbench={workbench} panel={panel} node={node} />
      </div>
    )
  }
}

const CheckboxEditor = {
  view({attrs}) {
    const {node, panel, workbench} = attrs;
    const toggleCheckbox = (e) => {
      const checkbox = node.getComponent(Checkbox);
      checkbox.checked = !checkbox.checked;
      node.changed();
    }
    return <input type="checkbox" style={{marginTop: "0.3rem", marginRight: "0.5rem"}} onclick={toggleCheckbox} checked={node.getComponent(Checkbox).checked} />
  }
}

// handles: expanded state, node menu+handle, children
export const OutlineNode: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    let {node, panel, workbench} = attrs;

    let isRef = false;
    let handleNode = node;
    if (node.refTo) {
      isRef = true;
      node = handleNode.refTo;
    }

    const expanded = workbench.workspace.getExpanded(panel.headNode, handleNode); 

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
        workbench.executeCommand("collapse", {node: handleNode, panel});
      } else {
        workbench.executeCommand("expand", {node: handleNode, panel});
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

    const subCount = (n) => {
      return n.childCount + n.getLinked("Fields").length;
    }

    return (
      <div onmouseover={hover} onmouseout={unhover}>
        <div class="node-row-outer-wrapper flex flex-row items-start">
          <svg class="node-menu shrink-0" xmlns="http://www.w3.org/2000/svg"
              style={{display: (state.hover)?"block":"none"}}  
              onclick={(e) => workbench.showMenu(e, {node: handleNode, panel})}
              oncontextmenu={(e) => workbench.showMenu(e, {node: handleNode, panel})} 
              data-menu="node"
              viewBox="0 0 16 16">
            <path style={{transform: "translateY(-1px)"}} fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
          </svg>
          <div class="node-handle shrink-0" onclick={toggle} ondblclick={open} oncontextmenu={(e) => workbench.showMenu(e, {node: handleNode, panel})} data-menu="node">
            {(objectHas(node, "handleIcon"))
              ? objectCall(node, "handleIcon")
              : <svg class="node-bullet" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                {(subCount(node) > 0 && !expanded)?<circle cx="8" cy="7" r="7" fill="lightgray" />:null}
                <circle cx="8" cy="7" r="3"/>,
                {(isRef)?<circle cx="8" cy="7" r="7" fill="none" stroke="gray" stroke-width="1" stroke-dasharray="3,3" />:null}
              </svg>
            }
          </div>
          {(node.raw.Rel === "Fields") 
            ? <div class="flex grow items-start flex-row">
                <div>
                  <NodeEditor workbench={workbench} panel={panel} node={node} onkeydown={checkCommands} />
                </div>
                <NodeEditor editValue={true} workbench={workbench} panel={panel} node={node} onkeydown={checkCommands} />
              </div>
            : <div class="flex grow items-start flex-row">
                {(node.hasComponent(Checkbox)) && <CheckboxEditor node={node} />}
                <NodeEditor workbench={workbench} panel={panel} node={node} onkeydown={checkCommands} />
              </div>
          }
        </div>
        {(expanded === true) &&
          <div class="expanded-node flex flex-row">
            <div class="indent flex" onclick={toggle}></div>
            <div class="grow">
              <div class="fields">
                {(node.getLinked("Fields").length > 0) &&
                  node.getLinked("Fields").map(n => <OutlineNode key={n.id} workbench={workbench} panel={panel} node={n} />)
                }
              </div>
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

// handles node name/text editing
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
  view ({attrs: {workbench, node, panel, onkeydown, disallowEmpty, editValue}, state}) {
    let prop = (editValue) ? "value" : "name";
    let displayValue = node[prop] || "";
    if (prop === "name") {
      displayValue = objectHas(node, "displayName") ? objectCall(node, "displayName", node) : node.name;
    }
    const value = (state.editing)?state.buffer:displayValue;
    
    const defaultKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    const startEdit = (e) => {
      state.initialValue = node[prop];
      workbench.context.node = node;
      state.editing = true;
      state.buffer = node[prop];
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
            node[prop] = state.initialValue;
          } else {
            node[prop] = state.buffer;
          }
        }
        state.buffer = undefined;
        workbench.context.node = null;
      }
    }
    const edit = (e) => {
      state.buffer = e.target.value;
      if (disallowEmpty && state.buffer.length === 0) {
        node[prop] = state.initialValue;
      } else {
        node[prop] = state.buffer;
      }
    }
    
    let id = `input-${panel.id}-${node.id}`;
    if (prop === "value") {
      id = id+"-value";
    }
    return (
      <div class="node-container">
        <textarea
          id={id}
          rows="1"
          onfocus={startEdit}
          onblur={finishEdit}
          oninput={edit}
          onkeydown={onkeydown||defaultKeydown}
          value={value}>{value}</textarea>
        <span style={{visibility: "hidden", position: "fixed"}}></span>
      </div>
    )
  }
}

// new node placeholder
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
      <div class="new-node flex flex-row items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
          <circle cx="8" cy="7" r="7" />
          <path style={{transform: "translate(0px, -1px)"}} d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        <div class="flex grow">
          <input class="grow"
            type="text"
            oninput={startNew}
            onkeydown={tabNew}
            value={""}
          />
        </div>
      </div>
    )
  }
}



