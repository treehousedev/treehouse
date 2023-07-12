import empty from "./empty.tsx";
import list from "./list.tsx";
import table from "./table.tsx";
import tabs from "./tabs.tsx";
import document from "./document.tsx";

export const views = {
  list,
  table,
  tabs,
  document,
}

export function getView(name) {
  return views[name] || empty;
}

window.registerView = (name, view) => {
  views[name] = view;
  workbench.commands.registerCommand({
    id: `view-${name}`,
    title: `View as ${toTitleCase(name)}`,
    action: (ctx: Context) => {
      if (!ctx.node) return;
      ctx.node.setAttr("view", name);
    }
  });
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}