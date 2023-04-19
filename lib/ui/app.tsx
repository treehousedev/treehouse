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
      <main class="workbench m-0 flex flex-row absolute inset-0" style={{overflow: "none"}}>
        <div class="sidebar flex flex-col" style={{width: (state.open)?"256px":"52px"}}>
          <div class="sidebar-topsection" style={{height: "56px"}}>
            <img class="logo" src="/icon_transparent.png" style={{width: "20px", height: "20px"}} />
          </div>
          <div class="grow sidebar-maincontent">
            {state.open && workbench.workspace.module.getRoot().getChildren().map(node => <NavNode node={node} expanded={true} level={0} workbench={workbench} />)}
          </div>  
          <div class="sidebar-bottomsection">
            <svg onclick={toggle} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sidebar"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </div>
        </div>
        <div class="main flex flex-col grow">
          <div class="topbar flex">
            <div class="topbar-item" onclick={() => workbench.openToday()} style={{cursor: "pointer", marginLeft: "var(--padding)", marginRight: "var(--padding)", display: "flex", alignItems: "center"}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                {/* <text text-anchor="middle" x="8" y="13" style={{fontSize: "0.55rem"}}>{(new Date()).getDate()}</text> */}
              </svg>
              <div>Today</div>
            </div>
            <div class="topbar-item" onclick={() => workbench.openQuickAdd()} style={{cursor: "pointer", marginLeft: "var(--padding)", marginRight: "var(--padding)", display: "flex", alignItems: "center"}}>
              <svg style={{marginRight: "var(--1)"}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              <div>Quick Add</div>
            </div>

            <Search workbench={workbench} />
            
            <div onclick={(e) => workbench.showMenu(e)} data-menu="settings" data-align="right" style={{cursor: "pointer", marginLeft: "var(--padding)", marginRight: "var(--padding)"}}>
              <svg  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
          </div>
          <div class="panels flex flex-row" style={{position: "relative", overflow: "hidden"}}>
            {workbench.panels.map(row => row.map(panel => <div style={{ 
                flex: "1 1 auto",
                overflowY: "auto"
              }}><PanelComponent workbench={workbench} panel={panel} /></div>))}
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
        <div style={{display: "flex", paddingBottom: "var(--2)" }}>
          <svg onclick={toggle} style={{cursor: "pointer", flexShrink: "0", paddingTop: "0px", marginRight: "0.125rem"}} class="feather feather-chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">          
            {(expandable)
                ?(state.expanded)
                  ? <polyline points="6 9 12 15 18 9"></polyline>
                  : <polyline points="9 18 15 12 9 6"></polyline>
              :null}
          </svg>
          
          <div onclick={open} style={{cursor: "pointer", lineHeight: "1.25", fontSize: "0.875rem", flexGrow: "1", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
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
