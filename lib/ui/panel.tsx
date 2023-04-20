import {NodeEditor, OutlineEditor} from "./outline.tsx";
import {Page} from "../mod.ts";

export const Panel = {
  view({attrs}) {
    const panel = attrs.panel;
    const workbench = attrs.workbench;
    const node = panel.currentNode;

    const close = (e) => {
      workbench.executeCommand("close-panel", {}, panel);
    }
    const goBack = (e) => {
      panel.back();
    }
    const maximize = (e) => {
      // todo: should be a command
      workbench.panels = [[panel]];
      workbench.context.panel = panel;
    }
    const editMarkdown = (e) => {
      node.getComponent(Page).markdown = e.target.value;
      node.changed();
    }
    function calcHeight(value="") {
      let numberOfLineBreaks = (value.match(/\n/g) || []).length;
      // min-height + lines x line-height + padding + border
      let newHeight = 20 + numberOfLineBreaks * 20;
      return newHeight;
    }
    return <div class="panel flex flex-col grow" style={{
        marginTop: "var(--padding)", 
        marginLeft: "calc(var(--padding)*2)", 
        marginRight: "calc(var(--padding)*2)", 
        paddingBottom: "var(--padding)"}}>
      <div class="bar" style={{
        display: "flex", 
        fontSize: "0.875rem",
        color: "var(--gray-600)", 
        gap: "var(--padding)", 
        paddingLeft: "var(--padding)",
        paddingRight: "var(--padding)",
        marginBottom: "calc(var(--padding)*1.5)"}}>
        {(panel.history.length>1)?
          <div style={{rightPadding: "var(--padding)"}}>
            <svg onclick={goBack} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </div>
        :null}
        <div style={{
          flexGrow: "1"
          }}>
          {(node.parent && node.parent.id !== "@root") ? <span style={{cursor: "pointer"}} onclick={() => workbench.open(node.parent)}>{node.parent.name}</span> : <span>/</span>}
        </div>
        {(workbench.panels.flat().length>1)?
          <div style={{display: "flex", gap: "var(--4)", zIndex: "0", color: "var(--gray-500)", alignItems: "center"}}>
            <svg  onclick={maximize} style={{cursor: "pointer"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            <svg onclick={close} style={{cursor: "pointer"}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
        :null}
      </div>
      <div class="body flex flex-col" style={{
        paddingLeft: "var(--padding)",
        paddingRight: "var(--padding)"
      }}>
        <div oncontextmenu={(e) => workbench.showMenu(e, {node, panel})} data-menu="node" style={{
            fontSize: "var(--6)",
            color: "var(--gray-900)",
            fontWeight: "700"
          }}>
          <NodeEditor workbench={workbench} panel={panel} node={node} disallowEmpty={true} />
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
        :null}
        <OutlineEditor workbench={workbench} panel={panel} node={node} />
      </div>
    </div>
  }
};