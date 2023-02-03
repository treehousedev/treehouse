import {OutlineEditor} from "./outline.tsx";
import {panelNode} from "../workspace.ts";
import {Page} from "../mod.ts";

export const Panel = {
  view({attrs}) {
    const panel = attrs.panel;
    const workspace = attrs.workspace;
    const node = panel.history[panel.history.length - 1];

    const close = (e) => {
      workspace.executeCommand("close-panel", {}, panel);
    }
    const goBack = (e) => {
      panel.history.pop();
    }
    const maximize = (e) => {
      workspace.panels = [[panel]];
    }
    const toBottom = (e) => {
      workspace.closePanel(panel);
      workspace.panels.push([panel]);
    }
    const toTop = (e) => {
      workspace.closePanel(panel);
      workspace.panels.unshift([panel]);
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
    return <div style={{display: "flex", flexDirection: "column", flexGrow: "1", margin: "var(--padding)", background: "white", borderRadius: "0.5rem", paddingBottom: "var(--padding)", height: "92vh"}}>
      <div  style={{display: "flex", color: "gray", padding: "var(--padding)", paddingTop: "0.5rem", paddingBottom: "0.5rem", gap: "var(--padding)", borderBottom: "4px solid var(--background)"}}>
        {(panel.history.length>1)?
          <div style={{rightPadding: "var(--padding)"}}>
            <svg onclick={goBack} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
          </div>
        :null}
        <div style={{flexGrow: "1"}}>
          {node.getParent()?.getName()}
        </div>
        {(workspace.panels.flat().length>1)?
          <div style={{display: "flex", gap: "0.5rem"}}>
            <svg onclick={toBottom} style={{transform: "scaleY(-1)"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.375 1A2.366 2.366 0 0 0 0 3.357v9.286A2.366 2.366 0 0 0 2.375 15h11.25A2.366 2.366 0 0 0 16 12.643V3.357A2.366 2.366 0 0 0 13.625 1H2.375ZM1 3.357C1 2.612 1.611 2 2.375 2h11.25C14.389 2 15 2.612 15 3.357V4H1v-.643ZM1 5h14v7.643c0 .745-.611 1.357-1.375 1.357H2.375A1.366 1.366 0 0 1 1 12.643V5Z"/>
            </svg>
            <svg onclick={toTop} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.375 1A2.366 2.366 0 0 0 0 3.357v9.286A2.366 2.366 0 0 0 2.375 15h11.25A2.366 2.366 0 0 0 16 12.643V3.357A2.366 2.366 0 0 0 13.625 1H2.375ZM1 3.357C1 2.612 1.611 2 2.375 2h11.25C14.389 2 15 2.612 15 3.357V4H1v-.643ZM1 5h14v7.643c0 .745-.611 1.357-1.375 1.357H2.375A1.366 1.366 0 0 1 1 12.643V5Z"/>
            </svg>
            <svg onclick={maximize} style={{transform: "scale(0.9)"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
            </svg>
            <svg onclick={close} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </div>
        :null}
      </div>
      <div oncontextmenu={(e) => workspace.showMenu(e, {node})} data-menu="node" style={{padding: "var(--padding)", fontSize: "2rem"}}>{node.getName()}</div>
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
      <OutlineEditor workspace={workspace} node={node} />
    </div>
  }
};