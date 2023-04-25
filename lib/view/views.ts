import empty from "./empty.tsx";
import list from "./list.tsx";
import table from "./table.tsx";

export function getView(name) {
  return {list, table}[name] || empty;
}