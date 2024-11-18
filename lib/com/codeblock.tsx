import { component } from "../model/components.ts";
import { Workbench, Context } from "../workbench/mod.ts";

export interface CodeExecutor {
  // executes the source and returns an output string.
  // exceptions in execution should be caught and returned as a string.
  execute(source: string, options: ExecuteOptions): Promise<string>;

  canExecute(options: ExecuteOptions): boolean;
}

export interface ExecuteOptions {
  language: string;
}

// defaultExecutor can be replaced with an external service, etc
export let defaultExecutor: CodeExecutor = {
  async execute(
    source: string,
    options: ExecuteOptions
  ): Promise<string> {
    if (options.language !== "javascript") {
      return `Unsupported language: ${options.language}`;
    }
    let output = window.eval(source);
    //return JSON.stringify(output);
    return "j";
  },

  canExecute(options: ExecuteOptions): boolean {
    if (options.language === "javascript") {
      return true;
    }
    return false;
  },
};

@component
export class CodeBlock {
  code: string;
  language: string;
  output: string;

  constructor() {
    this.code = "";
    this.language = "";
    this.output = "";
  }

  childrenView() {
    return {
      view: (vnode) => {
        return [
          m(CodeEditor, {
            path: vnode.attrs.path,
            workbench: vnode.attrs.workbench,
          }),
          m(CodeEditorOutput, {
            output: this.output,
            path: vnode.attrs.path,
          }),
        ];
      },
    };
  }

  handleIcon(collapsed: boolean = false): any {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="node-bullet"
      >
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    );
  }

  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "make-code-snippet",
      title: "Make Code Snippet",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.node.raw.Rel === "Fields") return false;
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document))
          return false;
        return true;
      },
      action: (ctx: Context) => {
        const com = new CodeBlock();
        if (ctx?.node) {
          ctx.node.addComponent(com);
          ctx.node.changed();
          workbench.workspace.setExpanded(
            ctx.path.head,
            ctx.path.node,
            true
          );
        }
      },
    });
  }
}

const CodeEditor = {
  oncreate(vnode) {
    const {
      dom,
      attrs: { path },
    } = vnode;
    const snippet = path.node.getComponent(CodeBlock);
    //@ts-ignore
    dom.jarEditor = new window.CodeJar(dom, (editor) => {
      // highlight.js does not trim old tags,
      // let's do it by this hack.
      editor.textContent = editor.textContent;
      //@ts-ignore
      window.hljs.highlightBlock(editor);
      snippet.language =
        //@ts-ignore
        window.hljs.highlightAuto(editor.textContent).language || "";
    });
    dom.jarEditor.updateCode(snippet.code);
    dom.jarEditor.onUpdate((code) => {
      snippet.code = code;
      path.node.changed();
    });
  },

  view({ attrs: { workbench, path } }) {
    // this cancels the keydown on the outline node
    // so you can use arrow keys normally
    const onkeydown = (e) => e.stopPropagation();

    return <div class="code-editor" onkeydown={onkeydown}></div>;
  },
};

const CodeEditorOutput = {
  output: "",
  oncreate(vnode) {
    const {
      dom,
      attrs: { path },
    } = vnode;
    const snippet = path.node.getComponent(CodeBlock);

    window.hljs.highlightBlock(dom);

    dom
      .querySelector("button")
      .addEventListener("click", async () => {
        console.log(snippet);
      });
  },

  view: (vnode) => {
    return m("div", { class: "code-editor-output" }, [
      m(
        "p",
        vnode.state.output ? "Output: " + vnode.state.output : ""
      ),
      m("button", "Run"),
    ]);
  },
};
