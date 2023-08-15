import { objectCall, objectHas } from "../../model/hooks.ts";
import { Document } from "../../com/document.tsx";

export const NodeEditor: m.Component = {
  view ({attrs: {workbench, path, onkeydown, oninput, disallowEmpty, editValue, placeholder}, state}) {
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
    let editor = TextAreaEditor;
    if (node.parent && node.parent.hasComponent(Document) && window.Editor) {
      editor = CodeMirrorEditor;
    }
    return m(editor, {id, getter, setter, display, onkeydown, onfocus, oninput, placeholder, workbench, path});
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

export const CodeMirrorEditor: m.Component<Attrs, State> = {
  oncreate({dom,state,attrs: {id, onkeydown, onfocus, onblur, oninput, getter, setter, display, placeholder}}) {
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
      if (oninput) {
        oninput(e);
      }
    }

    state.editor = new window.Editor(dom, value, placeholder);
    state.editor.onblur = finishEdit;
    state.editor.onfocus = startEdit;
    state.editor.oninput = edit;
    state.editor.onkeydown = onkeydown||defaultKeydown;
    dom.editor = state.editor;
    dom.id = id;
  },
  onupdate({dom,state,attrs: {getter, display}}) {
    state.editor.value = (state.editing) 
      ? state.buffer 
      : (display) ? display() : getter();
  },
  view () {
    return (
      <div class="text-editor"></div>
    )
  }
}

export const TextAreaEditor: m.Component<Attrs, State> = {
  oncreate({dom,attrs}) {
    const textarea = dom.querySelector("textarea");
    const initialHeight = textarea.offsetHeight;
    const span = dom.querySelector("span");
    this.updateHeight = () => {
      span.style.width = `${Math.max(textarea.offsetWidth, 100)}px`;
      span.innerHTML = textarea.value.replace("\n", "<br/>");
      let height = span.offsetHeight;
      if (height === 0 && initialHeight > 0) {
        height = initialHeight;
      }
      textarea.style.height = (height > 0) ? `${height}px` : `var(--body-line-height)`;
    }
    textarea.addEventListener("input", () => this.updateHeight());
    textarea.addEventListener("blur", () => span.innerHTML = "");
    setTimeout(() => this.updateHeight(), 50);
    if (attrs.onmount) attrs.onmount(textarea);
  },
  onupdate() {
    this.updateHeight();
  },
  view ({attrs: {id, onkeydown, onfocus, onblur, oninput, getter, setter, display, placeholder, path, workbench}, state}) {
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
      if (oninput) {
        oninput(e);
      }
    }
    const handlePaste = (e) => {
      const textData = e.clipboardData.getData('Text');
      if (textData.length > 0) {
        e.preventDefault();
        e.stopPropagation();

        const lines = textData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        state.buffer = lines.shift();
        setter(state.buffer, true);

        let node = path.node;
        for (const line of lines) {
          const newNode = workbench.workspace.new(line);
          newNode.parent = node.parent;
          newNode.siblingIndex = node.siblingIndex + 1;
          m.redraw.sync();
          const p = path.clone();
          p.pop();
          workbench.focus(p.append(newNode));
          node = newNode;
        }
      }
    }
    
    return (
      <div class="text-editor">
        <textarea
          id={id}
          rows="1"
          onfocus={startEdit}
          onblur={finishEdit}
          oninput={edit}
          onpaste={handlePaste}
          placeholder={placeholder}
          onkeydown={onkeydown||defaultKeydown}
          value={value}>{value}</textarea>
        <span style={{visibility: "hidden", position: "fixed"}}></span>
      </div>
    )
  }
}