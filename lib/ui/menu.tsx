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
      workbench.closeDialog();
    };
    return (
<ul class="menu" style={{
  margin: "0",
  display: "inline-block"
}}>
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
        display: "flex"
      }}>
        <div>{title}</div>
        {binding && <div class="keybindings grow text-right">{bindingSymbols(binding.key).join(" ").toUpperCase()}</div>}
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
