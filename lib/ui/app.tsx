import { Menu } from "./menu.tsx";
import { CommandPalette } from "./palette.tsx";
import { Panel as PanelComponent } from "./panel.tsx";
import { QuickAdd } from "./quickadd.tsx";


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
            <div onclick={() => workspace.openToday()} style={{cursor: "pointer", padding: "var(--padding)", display: "flex", alignItems: "center"}}>
              <svg style={{marginRight: "0.25rem", height: "1rem", width: "1rem"}} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                <text text-anchor="middle" x="8" y="13" style={{fontSize: "0.55rem"}}>{(new Date()).getDate()}</text>
              </svg>
              <div>Today</div>
            </div>
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div onclick={() => workspace.openQuickAdd()} style={{cursor: "pointer", padding: "var(--padding)"}}>
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
              {workspace.nodes.getRoot().getChildren().map(node => <NavNode node={node} expanded={true} workspace={workspace} />)}
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
        {workspace.quickadd && <QuickAdd workspace={workspace} />}
      </main>
    )
  }
};

const NavNode: m.Component = {
  view ({attrs: {node, workspace, expanded}, state}) {
    state.expanded = (state.expanded === undefined) ? expanded : state.expanded;
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
          <svg onclick={toggle} style={{cursor: "pointer", flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.5rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {state.expanded && <path d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z"/>}
            {!state.expanded && <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>}
          </svg>
          <div onclick={open} style={{cursor: "pointer", flexGrow: "1", display: "flex"}}>
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