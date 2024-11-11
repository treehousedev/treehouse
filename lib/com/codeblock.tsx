import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";


export interface CodeExecutor {
  // executes the source and returns an output string.
  // exceptions in execution should be caught and returned as a string.
  execute(source: string, options: ExecuteOptions): string;
}

export interface ExecuteOptions {
  language: string;
}

// defaultExecutor can be replaced with an external service, etc
export let defaultExecutor: CodeExecutor = {
  execute: (source: string, options: ExecuteOptions): string => {
    if (options.language !== "javascript") {
      return `Unsupported language: ${options.language}`;
    }
    return JSON.stringify(window.eval(source));
  }
}



@component
export class CodeBlock {
  code: string;

  constructor() {
    this.code = "";
  }

  childrenView() {
    return CodeEditor;
  }

  handleIcon(collapsed: boolean = false): any {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="node-bullet">
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
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
        return true;
      },
      action: (ctx: Context) => {
        const com = new CodeBlock();
        ctx.node.addComponent(com);
        ctx.node.changed();
        workbench.workspace.setExpanded(ctx.path.head, ctx.path.node, true);
      }
    });
  }

}


const CodeEditor = {
  oncreate({dom, attrs: {path}}) {
    const snippet = path.node.getComponent(CodeBlock);
    dom.jarEditor = new window.CodeJar(dom, (editor) => {
      // highlight.js does not trim old tags,
      // let's do it by this hack.
      editor.textContent = editor.textContent;
      window.hljs.highlightBlock(editor);
    });
    dom.jarEditor.updateCode(snippet.code);
    dom.jarEditor.onUpdate(code => {
      snippet.code = code;
      path.node.changed();
    });
  },

  view({attrs: {workbench, path}}) {
    // this cancels the keydown on the outline node
    // so you can use arrow keys normally
    const onkeydown = (e) => e.stopPropagation();
    
    return (
      <div class="code-editor" onkeydown={onkeydown}></div>
    )
  }
}