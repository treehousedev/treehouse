import { bindingSymbols } from "../keybinds.ts";

export const Menu: m.Component = {
  view({attrs}) {
    const workspace = attrs.workspace;
    const liStyle = {
      margin: "0px",  
      listStyleType: "none",
      padding: "0.25rem 0.5rem 0.25rem 0.5rem",
      display: "flex"
    };
    const shortcutStyle = {
      flexGrow: "1", 
      textAlign:"right", 
      color: "#888",
      marginLeft: "1rem"
    };
    const onclick = (item) => (e) => {
      workspace.executeCommand(item.id, attrs.ctx);
      workspace.hideMenu();
      e.stopPropagation();
    };
    return (
<ul class="menu" style={{
  margin: "0",
  position: "absolute",
  left: `${attrs.x}px`,
  top: `${attrs.y}px`,
  border: "1px solid var(--dark)",
  borderRadius: "0.25rem",
  padding: "0.25rem 0 0.25rem 0",
  display: "inline-block",
  background: "white",
  filter: "drop-shadow(2px 2px 4px #5555)",
  fontSize: "14px",
  minWidth: "200px"
}}>
  {attrs.items.map(i => <li onclick={onclick(i)} style={liStyle}><div>{i.title}</div><div style={shortcutStyle}>{bindingSymbols(i.key).join(" ").toUpperCase()}</div></li>)}
</ul>
    )  
  }
};

/* <li style={liStyle}><div>Indent</div><div style={shortcutStyle}>shift+A</div></li>
<li style={liStyle}><div>Open in new panel</div><div style={shortcutStyle}>shift+meta+Backspace</div></li>
<hr style={{marginLeft: "0.5rem", marginRight: "0.5rem" }} />
<li style={liStyle}>Show list view</li>
<li style={liStyle}>Move</li>
<li style={liStyle}>Delete node</li>
<hr style={{marginLeft: "0.5rem", marginRight: "0.5rem" }} /> */