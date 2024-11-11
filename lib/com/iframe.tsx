import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class InlineFrame {
  url: string;

  constructor() {
    this.url = "https://example.com";
  }

  childrenView() {
    return InlineFrameView;
  }
  handleIcon(collapsed: boolean = false): any {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="node-bullet">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    );
  }


  static initialize(workbench: Workbench) {
    workbench.commands.registerCommand({
      id: "make-iframe",
      title: "Make Inline Frame",
      when: (ctx: Context) => {
        if (!ctx.node) return false;
        if (ctx.node.raw.Rel === "Fields") return false;
        if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
        return true;
      },
      action: (ctx: Context) => {
        const frame = new InlineFrame();
        if (ctx.node.name.startsWith("http://") ||
            ctx.node.name.startsWith("https://")) {
          frame.url = ctx.node.name;
          ctx.node.addComponent(frame);
          workbench.defocus();
          ctx.node.name = ctx.node.name.replaceAll("https://", "").replaceAll("http://");
          workbench.workspace.setExpanded(ctx.path.head, ctx.node, true);
          workbench.focus(ctx.path);
        }
        
      }
    });
  }

}

const InlineFrameView = {
  view({attrs: {path}}) {
    const iframe = path.node.getComponent(InlineFrame);
    return (
      <div class="iframe-view">
        <iframe src={iframe.url} style={{width: "100%", height: "500px", border: "0", marginLeft: "-0.5rem"}}></iframe>
      </div>
    )
  }
}