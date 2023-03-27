import { bindingSymbols } from "../action/keybinds.ts";

export const Menu: m.Component = {
  view({attrs: {workbench, x, y, items, align, commands, ctx}}) {
    const onclick = (item, cmd) => (e) => {
      e.stopPropagation();
      if (item.disabled) {
        return;
      }
      if (item.onclick) {
        item.onclick();
      }
      if (cmd) {
        workbench.executeCommand(cmd.id, ctx);
      }
      workbench.hideMenu();
    };
    let posStyle = {left: `${x}px`};
    if (align === "right") {
      posStyle = {right: `${x}px`};
    }
    return (
<ul class="menu" style={Object.assign(posStyle, {
  margin: "0",
  position: "absolute",
  top: `${y}px`,
  border: "1px solid var(--dark)",
  borderRadius: "0.25rem",
  padding: "0 0 0.25rem 0",
  display: "inline-block",
  background: "white",
  filter: "drop-shadow(2px 2px 4px #5555)",
  fontSize: "14px",
  minWidth: "200px",
  zIndex: "20"
})}>
  {items.filter(i => !i.when || i.when()).map(i => {
    let title = "";
    let binding = undefined;
    let cmd = undefined;
    if (i.command) {
      cmd = commands.find(c => c.id === i.command);
      binding = workbench.keybindings.getBinding(cmd.id);
      title = cmd.title;
    }
    if (i.title) {
      title = i.title();
    }
    return (
      <li onclick={onclick(i, cmd)} class={(i.disabled)?"disabled":""} style={{
        margin: "0px",  
        listStyleType: "none",
        padding: "0.25rem 0.5rem 0.25rem 0.5rem",
        display: "flex"
      }}>
        <div>{title}</div>
        {binding && <div style={{
          flexGrow: "1", 
          textAlign:"right", 
          color: "#888",
          marginLeft: "1rem"
        }}>{bindingSymbols(binding.key).join(" ").toUpperCase()}</div>}
      </li>
    )
  })}
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