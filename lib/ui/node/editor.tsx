import { objectCall, objectHas } from "../../model/hooks.ts";

export const NodeEditor: m.Component = {
  view ({attrs: {workbench, path, onkeydown, disallowEmpty, editValue, placeholder}, state}) {
    const node = path.node;
    let prop = (editValue) ? "value" : "name";
    
    const display = () => {
      if (prop === "name") {
        return objectHas(node, "displayName") ? objectCall(node, "displayName", node) : node.name;
      }
      return node[prop] || "";
    }
    const onfocus = () => {
      state.initialValue = node[prop];
      workbench.context.node = node;
      workbench.context.path = path;
    }
    const getter = () => {
      return node[prop];
    }
    const setter = (v, finished) => {
      if (!node.isDestroyed) {
        if (disallowEmpty && v.length === 0) {
          node[prop] = state.initialValue;
        } else {
          node[prop] = v;
        }
      }
      if (finished) {
        workbench.context.node = null;
      }
    }

    if (node.raw.Rel === "Fields") {
      placeholder = (editValue) ? "Value" : "Field";
    }
    
    let id = `input-${path.id}-${node.id}`;
    if (prop === "value") {
      id = id+"-value";
    }
    return m(TextEditor, {id, getter, setter, display, onkeydown, onfocus, placeholder});
  }
}


interface Attrs {
  id?: string;
  onkeydown?: Function;
  onfocus?: Function;
  onblur?: Function;
  onmount?: Function;
  getter: Function;
  setter: Function;
  display?: Function;
}

interface State {
  editing: boolean;
  buffer: string;
}

export const TextEditor: m.Component<Attrs, State> = {
  oncreate({dom,attrs}) {
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
    if (attrs.onmount) attrs.onmount(textarea);
  },
  onupdate() {
    this.updateHeight();
  },
  view ({attrs: {id, onkeydown, onfocus, onblur, getter, setter, display, placeholder}, state}) {
    const value = (state.editing) 
      ? state.buffer 
      : (display) ? display() : getter();
    
    const defaultKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    const startEdit = (e) => {
      if (onfocus) onfocus(e);
      state.editing = true;
      state.buffer = getter();
    }
    const finishEdit = (e) => {
      // safari can trigger blur more than once
      // for a given element, namely when clicking
      // into devtools. this prevents the second 
      // blur setting node name to undefined/empty.
      if (state.editing) {
        state.editing = false;
        setter(state.buffer, true);
        state.buffer = undefined;
      }
      if (onblur) onblur(e);
    }
    const edit = (e) => {
      state.buffer = e.target.value;
      setter(state.buffer, false);
    }
    
    // TODO: node-container => text-editor
    return (
      <div class="node-container">
        <textarea
          id={id}
          rows="1"
          onfocus={startEdit}
          onblur={finishEdit}
          oninput={edit}
          placeholder={placeholder}
          onkeydown={onkeydown||defaultKeydown}
          value={value}>{value}</textarea>
        <span style={{visibility: "hidden", position: "fixed"}}></span>
      </div>
    )
  }
}