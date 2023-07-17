import { EditorState } from "@codemirror/state"
import { placeholder as placeholderPlugin, EditorView, ViewUpdate } from "@codemirror/view"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { javascript } from "@codemirror/lang-javascript"
import { defaultHighlightStyle, syntaxHighlighting} from "@codemirror/language"
import { classHighlighter } from "@lezer/highlight"

const proxyMerge = (...objects: any[]) => {
  const extra = objects.slice(1);

  return new Proxy(objects[0], {
    get: (target, name) => {
      const obj = extra.find(o => o[name]);
      return obj
        ? obj[name]
        : target[name];
    },
  });
};

export class Editor {
  view: EditorView;
  parent: HTMLElement;
  oninput?: Function;
  onblur?: Function;
  onfocus?: Function;
  onkeydown?: Function;

  constructor(parent: HTMLElement, value: string, placeholder?: string) {
    this.parent = parent;
    this.view = new EditorView({
      parent: parent,
      state: EditorState.create({
        doc: value,
        extensions: [
          EditorView.lineWrapping,
          placeholderPlugin(placeholder),
          syntaxHighlighting(defaultHighlightStyle),
          syntaxHighlighting(classHighlighter),
          markdown({
            defaultCodeLanguage: javascript(),
            base: markdownLanguage
          }),
          EditorView.updateListener.of((v: ViewUpdate) => {
            if (v.docChanged && this.oninput) {
              this.oninput(proxyMerge(new CustomEvent("UpdateEvent"), {target: this}));
              if (m) m.redraw();
            }
          }),
          EditorView.domEventHandlers({
            // input: (event, view) => {
            //   if (this.oninput) {
            //     this.oninput(proxyMerge(event, {target: this}));
            //     if (m) m.redraw();
            //   }
            // },
            blur: (event, view) => {
              if (this.onblur) {
                this.onblur(proxyMerge(event, {target: this}));
                if (m) m.redraw();
              }
            },
            focus: (event, view) => {
              if (this.onfocus) {
                this.onfocus(proxyMerge(event, {target: this}));
                if (m) m.redraw();
              }
            },
            keydown: (event, view) => {
              if (this.onkeydown) {
                let defaultPrevented = false;
                this.onkeydown(proxyMerge(event, {
                  target: this, 
                  preventDefault: () => defaultPrevented = true,
                  stopPropagation: () => null,
                }));
                if (m) m.redraw();
                return defaultPrevented;
              }
            },
          }),
        ]
      })
    });
  }

  get value(): string {
    return this.view.state.doc.toString();
  }

  set value(v: string) {
    if (v !== this.value) {
      const update = this.view.state.update({changes: {from: 0, to: this.view.state.doc.length, insert: v}});
      this.view.update([update]);
    }
  }

  get selectionStart(): number {
    return this.view.state.selection.main.anchor;
  }

  get selectionEnd(): number {
   return this.view.state.selection.main.head; 
  }

  focus() {
    this.view.focus();
  }

  blur() {
    this.view.contentDOM.blur();
  }

  setSelectionRange(start: number, end: number) {
    this.view.dispatch({
      selection: {
        anchor: start,
        head: end,
      },
    });
  }

  getBoundingClientRect(): any {
    return this.parent.getBoundingClientRect()
  }
}
