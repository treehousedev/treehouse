import { bindingSymbols } from "../action/keybinds.ts";

export const KeyboardReference = {
  view({ attrs }) {
    const workbench = attrs.workbench;
    const shortcuts = {
      "": [
        "pick-command",
      ],
      "Edit": [
        "cut",
        "copy",
        "copy-reference",
        "paste",
        "mark-done",
        "insert",
        "delete",
      ],
      "Navigate": [
        "expand",
        "collapse",
        "indent",
        "outdent",
        "move-up",
        "move-down",
        "prev",
        "next",
       ],
    };

    const getBindingSymbols = (cmd) => {
      const binding = workbench.keybindings.getBinding(cmd.id);
      return binding ? bindingSymbols(binding.key).join(" ").toUpperCase() : "";
    };

    return (
      <div class="reference">
        <h2>Keyboard Shortcuts</h2>

        {Object.entries(shortcuts).map(([header, ids]) => {
          return (
            <div>
              {(header.length !== 0) && <h3>{header}</h3>}
              <div>
                {ids.map(id => workbench.commands.commands[id]).map(cmd => (
                  <div class="flex item">
                    <div class="keybindings text-left">{getBindingSymbols(cmd)}</div>
                    <div class="grow">{cmd.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    )
  }
}