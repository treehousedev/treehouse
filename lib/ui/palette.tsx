
export const CommandPalette: m.Component = {
  onupdate({ state, dom }) {
    const children = dom.querySelector(".commands").children;
    if (state.selected !== undefined && children.length > 0) {
      children[state.selected].scrollIntoView({ block: "nearest" });
    }
  },

  oncreate({ dom }) {
    dom.querySelector("input").focus();
  },

  view({ attrs, state }) {
    const workbench = attrs.workbench;
    state.filter = (state.filter === undefined) ? "" : state.filter;
    const cmds = Object.values(workbench.commands.commands);
    const filtered = cmds.filter(cmd => {
      const value = cmd.title || cmd.id;
      return value.toLowerCase().startsWith(state.filter.toLowerCase());
    })
    const onkeydown = (e) => {
      const mod = (a, b) => ((a % b) + b) % b;
      if (e.key === "ArrowDown") {
        if (state.selected === undefined) {
          state.selected = 0;
          return;
        }
        state.selected = mod(state.selected + 1, filtered.length);
        return false;
      }
      if (e.key === "ArrowUp") {
        if (state.selected === undefined) {
          state.selected = 0;
        }
        state.selected = mod(state.selected - 1, filtered.length);
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
        position: "absolute",
        left: `${attrs.x}px`,
        top: `${attrs.y}px`
      }}>
        <div><input style={{ width: "98%", outline: "0", border: "0" }} type="text" onkeydown={onkeydown} oninput={autocomplete} placeholder="Enter command..." /></div>
        <div class="commands" style={{
          overflowY: "scroll",
          position: "relative"
        }}>
          {filtered.map((cmd, idx) => <div class={(state.selected === idx) ? "selected" : ""}>{cmd.title || cmd.id}</div>)}
        </div>
      </div>
    )
  }
}
