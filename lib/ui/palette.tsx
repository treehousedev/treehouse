import { bindingSymbols } from "../action/keybinds.ts";
import { Picker } from "./picker.tsx";

export const CommandPalette: m.Component = {

  view({ attrs: { workbench, ctx } }) {
    const getTitle = (cmd) => {
      const title = cmd.title || cmd.id;
      return title.replace('-', ' ').replace(/(^|\s)\S/g, t => t.toUpperCase());
    }
    const sort = (a, b) => {
      return getTitle(a).localeCompare(getTitle(b));
    }
    const onpick = (cmd) => {
      workbench.closeDialog();
      workbench.commands.executeCommand(cmd.id, ctx);
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

    const cmds = Object.values(workbench.commands.commands)
      .filter(cmd => !cmd.hidden)
      .filter(cmd => workbench.canExecuteCommand(cmd.id, ctx))
      .sort(sort);

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
              <div>{getTitle(cmd)}</div>
              <div class="keybindings grow text-right">{getBindingSymbols(cmd)}</div>
            </div>
          } />
      </div>
    )
  }
}

