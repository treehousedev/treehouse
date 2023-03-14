import { Menu } from "./menu.tsx";
import { CommandPalette } from "./palette.tsx";
import { Panel as PanelComponent } from "./panel.tsx";
import { QuickAdd } from "./quickadd.tsx";
import { Search } from "./search.tsx";
import { Notice } from "./notices.tsx";

export const App: m.Component = {
  view ({attrs: {workbench}, state}) {
    state.open = (state.open === undefined) ? true : state.open;
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
            <div onclick={() => workbench.openToday()} style={{cursor: "pointer", padding: "var(--padding)", display: "flex", alignItems: "center"}}>
              <svg style={{marginRight: "0.25rem", height: "1rem", width: "1rem"}} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                <text text-anchor="middle" x="8" y="13" style={{fontSize: "0.55rem"}}>{(new Date()).getDate()}</text>
              </svg>
              <div>Today</div>
            </div>
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div onclick={() => workbench.openQuickAdd()} style={{cursor: "pointer", padding: "var(--padding)", display: "flex", alignItems: "center"}}>
              <svg style={{marginRight: "0.25rem", height: "1rem", width: "1rem"}} xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09zM4.157 8.5H7a.5.5 0 0 1 .478.647L6.11 13.59l5.732-6.09H9a.5.5 0 0 1-.478-.647L9.89 2.41 4.157 8.5z"/>
              </svg>
              <div>Quick Add</div>
            </div>
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <Search workbench={workbench} />
            <div style={{borderLeft: "1px solid var(--dark)"}}></div>
            <div style={{padding: "var(--padding)"}}>
              <svg onclick={(e) => workbench.showMenu(e)} data-menu="settings" data-align="right" style={{cursor: "pointer"}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
              </svg>
            </div>
          </div>
        </div>
        <div style={{display: "flex", flexGrow: "1"}}>
          {state.open &&
            <div style={{width: "200px", padding: "var(--padding)"}}>
              {workbench.workspace.module.getRoot().getChildren().map(node => <NavNode node={node} expanded={true} level={0} workbench={workbench} />)}
            </div>
          }
          <div style={{flexGrow: "1", borderLeft: "1px solid var(--dark)"}}>
            {workbench.panels.map(row => (
              <div style={{display: "flex"}}>{row.map(panel => <PanelComponent workbench={workbench} panel={panel} />)}</div>
            ))}
          </div>
        </div>
        
        {workbench.curtain && 
          <div onclick={workbench.curtain.onclick} style={{
            zIndex: "10",
            position: "absolute",
            background: "black",
            opacity: (workbench.curtain.visible)?"50%":"0%",
            width: "100%",
            height: "100%"
          }}></div>}
        {workbench.menu && <Menu workbench={workbench} {...workbench.menu} />}
        {workbench.palette && <CommandPalette workbench={workbench} {...workbench.palette} />}
        {workbench.quickadd && <QuickAdd workbench={workbench} />}
        {workbench.notice && <Notice workbench={workbench} {...workbench.notice} />}
      </main>
    )
  }
};

const NavNode: m.Component = {
  view ({attrs: {node, workbench, expanded, level}, state}) {
    state.expanded = (state.expanded === undefined) ? expanded : state.expanded;
    const expandable = (node.childCount() > 0 && level < 3);
    const toggle = (e) => {
      if (!expandable) return;
      if (state.expanded) {
        state.expanded = false;
      } else {
        state.expanded = true;
      }
      e.stopPropagation();
    }
    const open = (e) => {
      workbench.open(node);
    }
    return (
      <div>
        <div style={{display: "flex", paddingBottom: "0.125rem", paddingTop: "0.125rem"}}>
          <svg onclick={toggle} style={{cursor: "pointer", flexShrink: "0", width: "1rem", height: "1rem", marginRight: "0.25rem", paddingLeft: "1px"}} xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
            {(expandable)
              ?(state.expanded)
                ? <path d="M3.204 5h9.592L8 10.481 3.204 5zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659z"/>
                : <path d="M6 12.796V3.204L11.481 8 6 12.796zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753z"/>
            :null}
          </svg>
          <div onclick={open} style={{cursor: "pointer", lineHeight: "1.45", fontSize: "0.875rem", flexGrow: "1", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
            {node.getName()}
          </div>
        </div>
        {state.expanded && 
          <div style={{marginLeft: "0.5rem"}}>
            {node.getChildren().filter(n => n.getName() !== "").map(n => <NavNode workbench={workbench} node={n} level={level+1} />)}
          </div>
        }
      </div>
    )
  }
};

//<div style={{flexGrow: "1", padding: "var(--padding)"}}>
//              <input type="text" placeholder="Search" style={{width: "99%", border: "0", outline: "0", background: "transparent", marginRight: "var(--padding)"}} />
//            </div>