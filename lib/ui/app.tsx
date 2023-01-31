import { LocalStorageStore } from "../backend.ts";
import { Environment, Context, panelNode } from "../workspace.ts";
import { Menu } from "./menu.tsx";
import { CommandPalette } from "./palette.tsx";
import { Panel as PanelComponent } from "./panel.tsx";

export const App: m.Component = {
  view (vnode) {
    const workspace = vnode.attrs.workspace;
    const reset = (e) => {
      localStorage.clear();
      location.reload();
    };
    return <main>
      <button onclick={reset}>Reset</button>
      {workspace.panels.map(row => (
        <div style={{display: "flex"}}>{row.map(panel => <PanelComponent workspace={workspace} panel={panel} />)}</div>
      ))}
      
      {workspace.menu && <Menu workspace={workspace} {...workspace.menu} />}
      {workspace.palette && <CommandPalette workspace={workspace} {...workspace.palette} />}
    </main>
  }
};
