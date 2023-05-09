import { OutlineEditor } from "./outline.tsx";
import { NodeEditor } from "./node/editor.tsx";
import { Page } from "../com/page.tsx";

export const Panel = {
  view({ attrs }) {
    const path = attrs.path;
    const workbench = attrs.workbench;
    const node = path.node;

    const close = (e) => {
      workbench.executeCommand("close-panel", {}, path);
    }
    const goBack = (e) => {
      path.pop();
    }
    const maximize = (e) => {
      // todo: should be a command
      workbench.panels = [path];
      workbench.context.path = path;
    }
    const editMarkdown = (e) => {
      node.getComponent(Page).markdown = e.target.value;
      node.changed();
    }
    function calcHeight(value = "") {
      let numberOfLineBreaks = (value.match(/\n/g) || []).length;
      // min-height + lines x line-height + padding + border
      let newHeight = 20 + numberOfLineBreaks * 20;
      return newHeight;
    }
    return <div class="panel flex flex-col grow">
      <div class="bar flex">
        {(path.length > 1) ?
          <div class="panel-back" style={{ rightPadding: "var(--padding)" }}>
            <svg onclick={goBack} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
            </svg>
          </div>
          : null}

        <div class="panel-back-parent grow">
          {(node.parent && node.parent.id !== "@root") ? <span style={{ cursor: "pointer" }} onclick={() => workbench.open(node.parent)}>{node.parent.name}</span> : <span>&nbsp;</span>}
        </div>

        {(workbench.panels.length > 1) ?
          <div class="panel-icons flex items-center">
            <svg onclick={maximize} style={{ cursor: "pointer" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            <svg onclick={close} style={{ cursor: "pointer" }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          : null}
      </div>

      <div class="body flex flex-col">
        <div class="title-node" oncontextmenu={(e) => workbench.showMenu(e, { node, path })} data-menu="node">
          <NodeEditor workbench={workbench} path={path} disallowEmpty={true} />
        </div>
        {(node.hasComponent(Page)) ?
          <textarea oninput={editMarkdown}
            value={node.getComponent(Page).markdown}
            placeholder="Enter Markdown text here"
            style={{
              marginLeft: "var(--padding)",
              padding: "var(--padding)",
              outline: "0",
              height: `${calcHeight(node.getComponent(Page).markdown)}px`,
              border: "0",
            }}>
            {node.getComponent(Page).markdown}
          </textarea>
          : null}
        <OutlineEditor workbench={workbench} path={path.sub()} />
      </div>
    </div>
  }
};
