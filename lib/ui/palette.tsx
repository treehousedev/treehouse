
export const CommandPalette: m.Component = {
  onupdate({state,dom}) {
    const children = dom.querySelector(".commands").children;
    if (state.selected !== undefined && children.length > 0) {
      children[state.selected].scrollIntoView({block: "nearest"});
    }
  },

  oncreate({dom}) {
    dom.querySelector("input").focus();
  },

  view({attrs, state}) {
    const workbench = attrs.workbench;
    state.filter = (state.filter === undefined) ? "" : state.filter;
    const cmds = Object.values(workbench.commands.commands);
    const filtered = cmds.filter(cmd => cmd.id.startsWith(state.filter));
    const onkeydown = (e) => {
      const mod = (a,b) => ((a % b) + b) % b;
      if (e.key === "ArrowDown") {
        if (state.selected === undefined) {
          state.selected = 0;
          return;
        }
        state.selected = mod(state.selected+1, filtered.length);
        return false;
      }
      if (e.key === "ArrowUp") {
        if (state.selected === undefined) {
          state.selected = 0;
        }
        state.selected = mod(state.selected-1, filtered.length);
        return false;
      }
      if (e.key === "Enter") {
        if (state.selected !== undefined) {
          workbench.commands.executeCommand(filtered[state.selected].id, attrs.ctx);
          workbench.hidePalette();
        }
        return false;
      }
    }
    const autocomplete = (e) => {
      state.filter = e.target.value;
      state.selected = 0;
    }
    return (
      <div class="palette" style={{
        margin: "0",
        position: "absolute",
        left: `${attrs.x}px`,
        top: `${attrs.y}px`,
        border: "1px solid var(--dark)",
        borderRadius: "0.25rem",
        padding: "0.5rem",
        background: "white",
        fontSize: "14px",
        minWidth: "400px",
        zIndex: "20"
      }}>
        <div><input style={{width: "98%", outline: "0", border: "0"}} type="text" onkeydown={onkeydown} oninput={autocomplete} placeholder="Enter command..." /></div>
        <div class="commands" style={{
          margin: "0.25rem",
          overflowY: "scroll",
          maxHeight: "200px",
          position: "relative"
        }}>
          {filtered.map((cmd, idx) => <div style={{padding: "0.25rem"}} class={(state.selected===idx)?"selected":""}>{cmd.title||cmd.id}</div>)}
        </div>
      </div>
    )
  }
}
