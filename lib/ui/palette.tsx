import { bindingSymbols } from "../action/keybinds.ts";
import { Picker } from "./picker.tsx";

export const CommandPalette: m.Component = {

  view({ attrs: { workbench, ctx } }) {
    const cmds = Object.values(workbench.commands.commands);
    
    const onpick = (cmd) => {
      workbench.commands.executeCommand(cmd.id, ctx);
      workbench.closeDialog();
    }
    const onchange = (state) => {
      state.items = cmds.filter(cmd => {
        const value = cmd.title || cmd.id;
        return value.toLowerCase().includes(state.input.toLowerCase());
      })
    }
    const getBindingSymbols = (cmd) => {
      const binding = workbench.keybindings.getBinding(cmd.id);
      return binding ? bindingSymbols(binding.key).join(" ").toUpperCase() : "";
    }
    return (
      <div class="palette">
        <Picker onpick={onpick} onchange={onchange}
          inputview={(onkeydown, oninput) => 
            <div>
              <input style={{ width: "98%" }} type="text" onkeydown={onkeydown} oninput={oninput} placeholder="Enter command..." />
            </div>
          }
          itemview={(cmd) => 
            <div class="flex">
              <div>{cmd.title || cmd.id}</div>
              <div class="keybindings grow text-right">{getBindingSymbols(cmd)}</div>
            </div>
          } />
      </div>
    )
  }
}

