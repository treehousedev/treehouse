import { OutlineNode } from "../ui/outline.tsx";

export default {
  view({ attrs: { workbench, path }, state }) {
    const node = path.node;
    state.tabs = (state.tabs === undefined) ? new Set() : state.tabs;
    state.selectedTab = (state.selectedTab === undefined) ? "" : state.selectedTab;
    node.children.forEach(n => {
      state.tabs.add(n.raw);
      if (state.selectedTab === "") state.selectedTab = n.raw.ID;
    });
    const handleTabClick = (id) => {
      state.selectedTab = id;
    };
    return (
      <div class="tabs-view">
        <div class="tabs">
          {[...state.tabs].map(n => <div class={n.ID === state.selectedTab ? "active" : ""} onclick={() => handleTabClick(n.ID)}>{n.Name}</div>)}
          <div style={{ flexGrow: 1 }}></div>
        </div>
        <div class="tab-content">
          {node.children.filter(n => n.id === state.selectedTab).map(n => (
            <OutlineNode key={n.id} workbench={workbench} path={path.append(n)} />
          ))}
        </div>
      </div>
    )
  }
}
