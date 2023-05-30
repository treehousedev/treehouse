
import { Workbench, Path } from "../workbench/mod.ts";
import { objectCall, objectHas } from "../model/hooks.ts";
import { NewNode } from "./node/new.tsx";
import { NodeEditor } from "./node/editor.tsx";

import { Checkbox } from "../com/checkbox.tsx";
import { Clock } from "../com/clock.tsx";
import { getView } from "../view/views.ts";

interface Attrs {
  path: Path;
  workbench: Workbench;
}

interface State {
  hover: boolean;
  editing: boolean;
  buffer?: string;
}

export const OutlineEditor: m.Component<Attrs> = {
  view ({attrs: {workbench, path}}) {
    return m(getView(path.node.getAttr("view")||"list"), {workbench, path});
  }
}

// handles: expanded state, node menu+handle, children
export const OutlineNode: m.Component<Attrs, State> = {
  view ({attrs, state, children}) {
    let {path, workbench} = attrs;
    let node = path.node;

    let isRef = false;
    let handleNode = node;
    if (node.refTo) {
      isRef = true;
      node = handleNode.refTo;
    }

    const expanded = workbench.workspace.getExpanded(path.head, handleNode);
    const placeholder = objectHas(node, "handlePlaceholder") ? objectCall(node, "handlePlaceholder") : '';

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
        workbench.executeCommand("collapse", {node: handleNode, path});
      } else {
        workbench.executeCommand("expand", {node: handleNode, path});
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
          workbench.executeCommand("delete", {node, path, event: e});
          return;
        }
        // cursor at beginning of non-empty text
        if (e.target.value !== "" && e.target.selectionStart === 0 && e.target.selectionEnd === 0) {
          e.preventDefault();
          e.stopPropagation();
          if (node.childCount > 0) {
            return;
          }
          
          // TODO: make this work as a command?
          const above = workbench.workspace.findAbove(path);
          if (!above) {
            return;
          }
          const oldName = above.node.name;
          above.node.name = oldName+e.target.value;
          node.destroy();
          m.redraw.sync();
          workbench.focus(above, oldName.length);
          
          return;
        }
        break;
      case "Enter":
        e.preventDefault();
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return;
        // cursor at end of text
        if (e.target.selectionStart === e.target.value.length) {
          if (node.childCount > 0 && workbench.workspace.getExpanded(path.head, node)) {
            workbench.executeCommand("insert-child", {node, path}, "", 0);
          } else {
            workbench.executeCommand("insert", {node, path});
          }
          e.stopPropagation();
          return;
        }
        // cursor at beginning of text
        if (e.target.selectionStart === 0) {
          workbench.executeCommand("insert-before", {node, path});
          e.stopPropagation();
          return;
        }
        // cursor in middle of text
        if (e.target.selectionStart > 0 && e.target.selectionStart < e.target.value.length) {
          workbench.executeCommand("insert", {node, path}, e.target.value.slice(e.target.selectionStart)).then(() => {
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
      
      workbench.executeCommand("open", {node, path});
      
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

    const showHandle = () => {
      if (node.id === workbench.context?.node?.id || state.hover) {
        return true;
      }
      if (node.name.length > 0) return true;
      if (placeholder.length > 0) return true;
    }

    return (
      <div onmouseover={hover} onmouseout={unhover}>
        <div class="node-row-outer-wrapper flex flex-row items-start">
          <svg class="node-menu shrink-0" xmlns="http://www.w3.org/2000/svg"
              onclick={(e) => workbench.showMenu(e, {node: handleNode, path})}
              oncontextmenu={(e) => workbench.showMenu(e, {node: handleNode, path})} 
              data-menu="node"
              viewBox="0 0 16 16">
            {state.hover && <path style={{transform: "translateY(-1px)"}} fill="currentColor" fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />}
          </svg>
          <div class="node-handle shrink-0" onclick={toggle} ondblclick={open} oncontextmenu={(e) => workbench.showMenu(e, {node: handleNode, path})} data-menu="node" style={{ display: showHandle() ? 'block' : 'none' }}>
            {(objectHas(node, "handleIcon"))
              ? objectCall(node, "handleIcon", subCount(node) > 0 && !expanded)
              : <svg class="node-bullet" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                {(subCount(node) > 0 && !expanded)?<circle id="node-collapsed-handle" cx="8" cy="7" r="7" />:null}
                <circle cx="8" cy="7" r="3" fill="currentColor" />,
                {(isRef)?<circle id="node-reference-handle" cx="8" cy="7" r="7" fill="none" stroke-width="1" stroke="currentColor" stroke-dasharray="3,3" />:null}
              </svg>
            }
          </div>
          {(node.raw.Rel === "Fields") 
            ? <div class="flex grow items-start flex-row">
                <div>
                  <NodeEditor workbench={workbench} path={path} onkeydown={checkCommands} />
                </div>
                <NodeEditor editValue={true} workbench={workbench} path={path} onkeydown={checkCommands} />
              </div>
            : <div class="flex grow items-start flex-row">
                {objectHas(node, "beforeEditor") && m(objectCall(node, "beforeEditor"), {node})}
                <NodeEditor workbench={workbench} path={path} onkeydown={checkCommands} placeholder={placeholder} />
                {objectHas(node, "afterEditor") && m(objectCall(node, "afterEditor"), {node})}
              </div>
          }
        </div>
        {objectHas(node, "belowEditor") && m(objectCall(node, "belowEditor"), {node})}
        {(expanded === true) &&
          <div class="expanded-node flex flex-row">
            <div class="indent flex" onclick={toggle}></div>
            <div class="view grow">
              {m(getView(node.getAttr("view")||"list"), {workbench, path})}
            </div>
          </div>
        }
      </div>
    )
  }
};







