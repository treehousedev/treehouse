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
          <div class="sidebar-top" style={{height: "56px"}}>
            <div class="logo" />
          </div>
          <div class="grow sidebar-main">
            {state.open && workbench.workspace.bus.root().children.map(node => <NavNode node={node} expanded={true} level={0} workbench={workbench} />)}
          </div>
          <div class="sidebar-bottom">
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

            <div class="searchbar flex grow">
              <div>
                <div class="flex" style={{margin: "1px"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <input type="text" placeholder="Search" 
                    onkeydown={(e) => {
                      if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return;
                      const input = e.target.getBoundingClientRect();
                      workbench.showDialog(() => <Search workbench={workbench} input={e.key} />, false, {
                        // TODO: make these not so hardcoded offsets
                        left: `${input.left-33}px`,
                        top: `${input.top-9}px`,
                        width: `${input.width+33}px`
                      });
                      e.preventDefault();
                    }} 
                    style={{
                      border: "0", 
                      outline: "0", 
                      background: "transparent", 
                      paddingTop: "3px"
                    }} />
                </div>
              </div>
            </div>
            
            <div onclick={(e) => workbench.showMenu(e)} data-menu="settings" data-align="right" style={{cursor: "pointer", marginLeft: "var(--padding)", marginRight: "var(--padding)"}}>
              <svg  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
          </div>

          <div class="panels flex flex-row grow" style={{position: "relative", overflow: "hidden"}}>
            {workbench.panels.map(path => <div><PanelComponent workbench={workbench} path={path} /></div>)}
          </div>

          <div class="mobile-nav flex-row">
            <div>
              <svg onclick={() => {
                const sidebarStyle = document.querySelector(".sidebar").style;
                if (sidebarStyle.display !== "flex") {
                  sidebarStyle.display = "flex";
                } else {
                  sidebarStyle.display = "none";
                }
              }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sidebar"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </div>
            <div onclick={() => workbench.openToday()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-calendar">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div onclick={() => workbench.openQuickAdd()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <div onclick={() => workbench.showDialog(() => <Search workbench={workbench} />, true, {top: "25%", bottom: "100px"})}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div onclick={(e) => workbench.showMenu(e, undefined, {bottom: "100px", marginTop: "auto"})} data-menu="settings">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </div>
          </div>
        </div>

        
        {workbench.popover && 
          <div class="popover" style={{position: "absolute", ...workbench.popover.style}}>
            {workbench.popover.body()}
          </div>
        }


        <dialog 
          class={(workbench.dialog.backdrop) ? "popover modal backdrop" : "popover modal"} 
          style={(workbench.dialog.style) ? {margin: "0", ...workbench.dialog.style} : {top: "-50%"}}
          oncancel={e => {
            if (workbench.dialog.explicitClose === true) {
              e.preventDefault();
              return;
            }
            // resets body
            workbench.dialog.body = () => null;
          }}
          onclick={e => {
            const dialog = e.target.closest("dialog");
            const rect = dialog.getBoundingClientRect();
            const zeroClick = (e.clientX == 0 && e.clientY == 0); // clicking select dropdown gives 0,0
            if ((workbench.dialog.explicitClose !== true) && (
              e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            ) && !zeroClick) {
              workbench.closeDialog();
            }
          }}>
            {workbench.dialog.body()}
        </dialog>

        <dialog class="menu popover" 
          style={{margin: "0", ...workbench.menu.style}}
          oncancel={e => {
            // resets body
            workbench.menu.body = () => null;
          }}
          onclick={e => {
            const dialog = e.target.closest("dialog");
            const rect = dialog.getBoundingClientRect();
            if (e.clientX < rect.left ||
              e.clientX > rect.right ||
              e.clientY < rect.top ||
              e.clientY > rect.bottom
            ) {
              workbench.closeMenu();
            }
          }}>
            {workbench.menu.body()}
        </dialog>
      </main>
    )
  }
};

const NavNode: m.Component = {
  view ({attrs: {node, workbench, expanded, level}, state}) {
    state.expanded = (state.expanded === undefined) ? expanded : state.expanded;
    const expandable = (node.childCount > 0 && level < 3);
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
      const mobileNav = document.querySelector(".mobile-nav");
      if (mobileNav.offsetHeight) {
        document.querySelector(".sidebar").style.display = "none";
      }
      workbench.open(node);
    }
    return (
      <div>
        <div class="sidebar-item flex">
          <svg onclick={toggle} class="feather feather-chevron-right shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">          
            {(expandable)
                ?(state.expanded)
                  ? <polyline points="6 9 12 15 18 9"></polyline>
                  : <polyline points="9 18 15 12 9 6"></polyline>
              :null}
          </svg>
          
          <div class="sidebar-item-label grow" onclick={open} style={{cursor: "pointer", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
            {node.name}
          </div>
        </div>
        {state.expanded && 
          <div class="sidebar-item-nested">
            {node.children.filter(n => n.name !== "").map(n => <NavNode workbench={workbench} node={n} level={level+1} />)}
          </div>
        }
      </div>
    )
  }
};
