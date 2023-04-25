
export const NewNode = {
  view({attrs: {workbench, panel, node}}) {
    const startNew = (e) => {
      workbench.executeCommand("insert-child", {node, panel}, e.target.value);
    }
    const tabNew = (e) => {
      if (e.key === "Tab") {
        e.stopPropagation();
        e.preventDefault();
        if (node.childCount > 0) {
          const lastchild = node.children[node.childCount-1];
          workbench.executeCommand("insert-child", {node: lastchild, panel});
        }
      }
    }
    return (
      <div class="new-node flex flex-row items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 16 16">
          <circle cx="8" cy="7" r="7" />
          <path style={{transform: "translate(0px, -1px)"}} d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        <div class="flex grow">
          <input class="grow"
            type="text"
            oninput={startNew}
            onkeydown={tabNew}
            value={""}
          />
        </div>
      </div>
    )
  }
}