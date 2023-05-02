export { Workbench } from "./workbench.ts";
export { Path } from "./path.ts";
export { Workspace } from "./workspace.ts";

import { Node } from "../model/mod.ts";

/**
 * Context is a user context object interface. This is used to
 * track a global context for the user, mainly what node(s) are selected,
 * but is also used for local context in commands.
 */
export interface Context {
  path: Path;
  node: Node|null;
  nodes?: Node[];
  event?: Event;
  
}