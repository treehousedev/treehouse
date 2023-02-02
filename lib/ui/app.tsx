import { LocalStorageStore } from "../backend.ts";
import { Environment, Context, panelNode } from "../workspace.ts";
import { Menu } from "./menu.tsx";
import { CommandPalette } from "./palette.tsx";
import { Panel as PanelComponent } from "./panel.tsx";

export const App: m.Component = {
  view ({attrs: {workspace}, state}) {
    state.open = (state.open === undefined) ? true : state.open;
    const reset = (e) => {
      localStorage.clear();
      location.reload();
    };
    const toggle = (e) => {
      if (state.open) {
        state.open = false;
      } else {
        state.open = true;
      }
    }
    return (
      <main  style={{margin: "0", display: "flex", flexDirection: "column", position: "absolute", top: "0", bottom: "0", left: "0", right: "0"}}>
        <div style={{display: "flex", borderBottom: "1px solid var(--dark)"}}>
          {state.open &&
            <div style={{width: "200px", display: "flex", padding: "var(--padding)"}}>
              <div style={{flexGrow: "1"}}><img src="/icon_transparent.png" style={{opacity: "70%", width: "16px", height: "16px"}} /></div>
              <svg onclick={toggle} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-layout-sidebar" viewBox="0 0 16 16">
                <path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm5-1v12h9a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5zM4 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2V2z"/>
              </svg>
            </div>
          }
          <div style={{flexGrow: "1", display: "flex"}}>
            {!state.open && <svg onclick={toggle} style={{padding: "var(--padding)", borderLeft: "1px solid var(--dark)"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-layout-sidebar" viewBox="0 0 16 16">
              <path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm5-1v12h9a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5zM4 2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2V2z"/>
            </svg>}
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div style={{padding: "var(--padding)"}}>
              Today
            </div>
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div style={{padding: "var(--padding)"}}>
              Quick Add
            </div>
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div style={{flexGrow: "1", padding: "var(--padding)"}}>
              <input type="text" placeholder="Search" style={{width: "99%", border: "0", outline: "0", background: "transparent", marginRight: "var(--padding)"}} />
            </div>
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div style={{padding: "var(--padding)"}}>
              <button onclick={reset}>Reset</button>
            </div>
          </div>
        </div>
        <div style={{display: "flex", flexGrow: "1"}}>
          {state.open &&
            <div style={{width: "200px", padding: "var(--padding)"}}>
              {workspace.nodes.roots()[0].getChildren().map(node => <NavNode node={node} workspace={workspace} />)}
            </div>
          }
          <div style={{flexGrow: "1", borderLeft: "1px solid var(--dark)"}}>
            {workspace.panels.map(row => (
              <div style={{display: "flex"}}>{row.map(panel => <PanelComponent workspace={workspace} panel={panel} />)}</div>
            ))}
          </div>
        </div>
       
        {workspace.menu && <Menu workspace={workspace} {...workspace.menu} />}
        {workspace.palette && <CommandPalette workspace={workspace} {...workspace.palette} />}
      </main>
    )
  }
};

const NavNode: m.Component = {
  view ({attrs: {node, workspace}, state}) {
    state.expanded = (state.expanded === undefined) ? false : state.expanded;
    const toggle = (e) => {
      if (state.expanded) {
        state.expanded = false;
      } else {
        state.expanded = true;
      }
      e.stopPropagation();
    }
    const open = (e) => {
      workspace.open(node);
    }
    return (
      <div>
        <div style={{display: "flex"}}>
          <svg onclick={toggle} style={{flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 16 16">
            {state.expanded && <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>}
            {!state.expanded && <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>}
          </svg>
          <div onclick={open} style={{flexGrow: "1", display: "flex"}}>
            {node.getName()}
          </div>
        </div>
        {state.expanded && 
          <div style={{paddingBottom: "0.25rem", marginLeft: "0.5rem"}}>
            {node.getChildren().map(n => <NavNode workspace={workspace} node={n} />)}
          </div>
        }
      </div>
    )
  }
};