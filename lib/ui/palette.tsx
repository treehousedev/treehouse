import { bindingSymbols } from "../action/keybinds.ts";

export const CommandPalette: m.Component = {
  onupdate({ state, dom }) {
    const children = dom.querySelector(".commands").children;
    if (state.selected !== undefined && children.length > 0) {
      children[state.selected].scrollIntoView({ block: "nearest" });
    }
  },

  oncreate({ state, dom }) {
    dom.querySelector("input").focus();
    if (state.selected === undefined) {
      state.selected = 0;
    }
  },

  view({ attrs, state }) {
    const workbench = attrs.workbench;
    state.filter = (state.filter === undefined) ? "" : state.filter;
    const cmds = Object.values(workbench.commands.commands);
    const filtered = cmds.filter(cmd => {
      const value = cmd.title || cmd.id;
      return value.toLowerCase().includes(state.filter.toLowerCase());
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
    const onclick = (cmd) => {
      workbench.commands.executeCommand(cmd.id, attrs.ctx);
      workbench.hidePalette();
    }
    const autocomplete = (e) => {
      state.filter = e.target.value;
      state.selected = 0;
    }
    const getBindingSymbols = (cmd) => {
      const binding = workbench.keybindings.getBinding(cmd.id);
      return binding ? bindingSymbols(binding.key).join(" ").toUpperCase() : "";
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
          {filtered.map((cmd, idx) => (
            <div class={(state.selected === idx) ? "selected" : ""} onclick={() => onclick(cmd)} style={{ display: "flex" }}>
              <div>{cmd.title || cmd.id}</div>
              <div class="keybindings grow text-right">{getBindingSymbols(cmd)}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
