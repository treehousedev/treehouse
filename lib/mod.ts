/**
 * A configurable, embeddable frontend for a graph/outline based note-taking tool.
 * 
 * Treehouse can be embedded on a page and given a backend for a fully functional
 * SPA. The backend adapter provides hooks to integrate with various backends.
 * 
 * Typical usage involves including resource dependencies on the page then running:
 * 
 * ```ts
 * import {setup, BrowserBackend} from "https://treehouse.sh/lib/treehouse.min.js";
 * setup(document, document.body, new BrowserBackend());
 * ```
 * 
 * In this case using the built-in BrowserBackend to store state in localStorage.
 * For more information see the [Quickstart Guide](https://treehouse.sh/docs/quickstart/).
 * 
 * @module
 */
import { Workbench } from "./workbench/mod.ts";
import { App } from "./ui/app.tsx";
import { Backend } from "./backend/mod.ts";
import { SearchNode } from "./com/search.tsx";
import { Checkbox } from "./com/checkbox.tsx";
import { Page } from "./com/page.tsx";
import { TextField } from "./com/textfield.tsx";

export { BrowserBackend, SearchIndex_MiniSearch} from "./backend/browser.ts";
export { GitHubBackend } from "./backend/github.ts";


/**
 * setup initializes and mounts a workbench UI with a given backend adapter to a document.
 * More specifically, first it initializes the given backend, then creates and initializes
 * a Workbench instance with that backend, then it mounts the App component to the given
 * target element. It will also add some event listeners to the document and currently
 * this is where it registers all the built-in commands and their keybindings, as well
 * as menus. 
 */
export async function setup(document: Document, target: HTMLElement, backend: Backend) {
  if (backend.initialize) {
    await backend.initialize();
  }
  const workbench = new Workbench(backend);
  window.workbench = workbench;
  await workbench.initialize();
  
  // pretty specific to github backend right now
  document.addEventListener("BackendError", () => {
    workbench.showNotice("lockstolen", () => {
      location.reload();
    });
  });

  workbench.commands.registerCommand({
    id: "create-search",
    title: "Create Search Node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const search = new SearchNode();
      ctx.node.addComponent(search);
      workbench.workspace.setExpanded(ctx.panel.headNode, ctx.node, true);
    }
  });


  workbench.commands.registerCommand({
    id: "view-list",
    title: "View as List",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      ctx.node.setAttr("view", "list");
    }
  });

  workbench.commands.registerCommand({
    id: "view-table",
    title: "View as Table",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      ctx.node.setAttr("view", "table");
    }
  });

  workbench.commands.registerCommand({
    id: "add-page",
    title: "Add page",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const page = new Page();
      ctx.node.addComponent(page);
    }
  });

  workbench.commands.registerCommand({
    id: "remove-page",
    title: "Remove page",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      ctx.node.removeComponent(Page);
    }
  });

  workbench.commands.registerCommand({
    id: "add-checkbox",
    title: "Add checkbox",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const checkbox = new Checkbox();
      ctx.node.addComponent(checkbox);
    }
  });

  workbench.commands.registerCommand({
    id: "remove-checkbox",
    title: "Remove checkbox",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      ctx.node.removeComponent(Checkbox);
    }
  });

  workbench.commands.registerCommand({
    id: "create-field",
    title: "Create Field",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.node.childCount > 0) return;
      if (ctx.node.componentCount > 0) return;
      const field = workbench.workspace.new(ctx.node.name, "");
      field.raw.Parent = ctx.node.parent.id;
      const text = new TextField();
      field.addComponent(text);
      ctx.node.parent.addLinked("Fields", field);
      ctx.node.destroy();
      m.redraw.sync();
      workbench.focus(field);
    }
  });

  workbench.commands.registerCommand({
    id: "mark-done",
    title: "Mark done",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.node.hasComponent(Checkbox)) {
        const checkbox = ctx.node.getComponent(Checkbox);
        if (!checkbox.checked) {
          checkbox.checked = true;
          ctx.node.changed();
        } else {
          ctx.node.removeComponent(Checkbox);
        }
      } else {
        const checkbox = new Checkbox();
        ctx.node.addComponent(checkbox);
      }
    }
  });
  workbench.keybindings.registerBinding({command: "mark-done", key: "meta+enter" });



  workbench.commands.registerCommand({
    id: "expand",
    title: "Expand",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workbench.workspace.setExpanded(ctx.panel.headNode, ctx.node, true);
      m.redraw();
    }
  });
  workbench.keybindings.registerBinding({command: "expand", key: "meta+arrowdown" });
  workbench.commands.registerCommand({
    id: "collapse",
    title: "Collapse",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workbench.workspace.setExpanded(ctx.panel.headNode, ctx.node, false);
      m.redraw();
    }
  });
  workbench.keybindings.registerBinding({command: "collapse", key: "meta+arrowup" });
  workbench.commands.registerCommand({
    id: "indent",
    title: "Indent",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const prev = ctx.node.prevSibling;
      if (prev !== null) {
        ctx.node.parent = prev;
        workbench.workspace.setExpanded(ctx.panel.headNode, prev, true);

        const node = ctx.node; // redraw seems to unset ctx.node
        m.redraw.sync();
        workbench.focus(node);
      }
    }
  });
  workbench.keybindings.registerBinding({command: "indent", key: "tab"});
  workbench.commands.registerCommand({
    id: "outdent",
    title: "Outdent",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const parent = ctx.node.parent;
      if (parent !== null && parent.id !== "@root") {
        ctx.node.parent = parent.parent;
        ctx.node.siblingIndex = parent.siblingIndex+1;
        if (parent.childCount === 0) {
          workbench.workspace.setExpanded(ctx.panel.headNode, parent, false);
        }
        
        const node = ctx.node; // redraw seems to unset ctx.node
        m.redraw.sync();
        workbench.focus(node);
      }
    }
  });
  workbench.keybindings.registerBinding({command: "outdent", key: "shift+tab"});
  workbench.commands.registerCommand({
    id: "move-up",
    title: "Move Up",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const node = ctx.node; // redraw seems to unset ctx.node
      const parent = node.parent;
      if (parent !== null && parent.id !== "@root") {
        const children = parent.childCount;
        if (node.siblingIndex === 0) {
          if (!parent.prevSibling) {
            return;
          }
          const parentSib = parent.prevSibling;
          node.parent = parentSib;
          node.siblingIndex = parentSib.childCount-1;
          workbench.workspace.setExpanded(ctx.panel.headNode, parentSib, true);
          m.redraw.sync();
          workbench.focus(node);
        } else {
          if (children === 1) {
            return;
          }
          node.siblingIndex = node.siblingIndex-1;
          m.redraw.sync();
        }
      }
    }
  });
  workbench.keybindings.registerBinding({command: "move-up", key: "shift+meta+arrowup"});
  workbench.commands.registerCommand({
    id: "move-down",
    title: "Move Down",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const node = ctx.node; // redraw seems to unset ctx.node
      const parent = node.parent;
      if (parent !== null && parent.id !== "@root") {
        const children = parent.childCount;
        if (node.siblingIndex === children-1) {
          if (!parent.nextSibling) {
            return;
          }
          const parentSib = parent.nextSibling;
          node.parent = parentSib;
          node.siblingIndex = 0;
          workbench.workspace.setExpanded(ctx.panel.headNode, parentSib, true);
          m.redraw.sync();
          workbench.focus(node);
        } else {
          if (children === 1) {
            return;
          }
          node.siblingIndex = node.siblingIndex+1;
          m.redraw.sync();
        }
      }
    }
  });
  workbench.keybindings.registerBinding({command: "move-down", key: "shift+meta+arrowdown"});
  workbench.commands.registerCommand({
    id: "insert-child",
    title: "Insert Child",
    action: (ctx: Context, name: string = "", siblingIndex?: number) => {
      if (!ctx.node) return;
      const node = workbench.workspace.new(name);
      node.parent = ctx.node;
      if (siblingIndex !== undefined) {
        node.siblingIndex = siblingIndex;
      }
      workbench.workspace.setExpanded(ctx.panel.headNode, ctx.node, true);
      m.redraw.sync();
      workbench.focus(node, ctx.panel, name.length);
    }
  });
  workbench.commands.registerCommand({
    id: "insert-before",
    title: "Insert Before",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const node = workbench.workspace.new("");
      node.parent = ctx.node.parent;
      node.siblingIndex = ctx.node.siblingIndex;
      m.redraw.sync();
      workbench.focus(node, ctx.panel);
    }
  });
  workbench.commands.registerCommand({
    id: "insert",
    title: "Insert Node",
    action: (ctx: Context, name: string = "") => {
      if (!ctx.node) return;
      const node = workbench.workspace.new(name);
      node.parent = ctx.node.parent;
      node.siblingIndex = ctx.node.siblingIndex+1;
      m.redraw.sync();
      workbench.focus(node, ctx.panel);
    }
  });
  workbench.keybindings.registerBinding({command: "insert", key: "shift+enter"});
  workbench.commands.registerCommand({
    id: "create-reference",
    title: "Create Reference",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const node = workbench.workspace.new("");
      node.parent = ctx.node.parent;
      node.siblingIndex = ctx.node.siblingIndex+1;
      node.refTo = ctx.node;
      m.redraw.sync();
      workbench.focus(node, ctx.panel);
    }
  });
  workbench.commands.registerCommand({
    id: "delete",
    title: "Delete node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.node.id.startsWith("@")) return;
      const above = workbench.workspace.findAbove(ctx.panel.headNode, ctx.node);
      ctx.node.destroy();
      m.redraw.sync();
      if (above) {
        let pos = 0;
        if (ctx.event && ctx.event.key === "Backspace") {
          pos = above.name.length;
        }
        if (above.childCount === 0) {
          // TODO: use subCount
          workbench.workspace.setExpanded(ctx.panel.headNode, above, false);
        }
        workbench.focus(above, ctx.panel, pos);
      }
    }
  });
  workbench.keybindings.registerBinding({command: "delete", key: "shift+meta+backspace" });
  workbench.commands.registerCommand({
    id: "prev",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const above = workbench.workspace.findAbove(ctx.panel.headNode, ctx.node);
      if (above) {
        workbench.focus(above, ctx.panel);
      }
    }
  });
  workbench.keybindings.registerBinding({command: "prev", key: "arrowup"});
  workbench.commands.registerCommand({
    id: "next",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const below = workbench.workspace.findBelow(ctx.panel.headNode, ctx.node);
      if (below) {
        workbench.focus(below, ctx.panel);
      }
    }
  });
  workbench.keybindings.registerBinding({command: "next", key: "arrowdown"});
  workbench.commands.registerCommand({
    id: "pick-command",
    action: (ctx: Context) => {
      let node = ctx.node;
      let posBelow = false;
      if (!node) {
        node = ctx.panel.headNode;
        posBelow = true;
      }
      const trigger = workbench.getInput(node);
      const rect = trigger.getBoundingClientRect();
      let x = document.body.scrollLeft+rect.x+(trigger.selectionStart * 10)+20;
      let y = document.body.scrollTop+rect.y-8;
      if (posBelow) {
        x = document.body.scrollLeft+rect.x;
        y = document.body.scrollTop+rect.y+rect.height;
      }
      workbench.showPalette(x, y, workbench.newContext({node}));
    }
  });
  workbench.keybindings.registerBinding({command: "pick-command", key: "meta+k"});
  workbench.commands.registerCommand({
    id: "new-panel",
    title: "Open in New Panel",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workbench.openNewPanel(ctx.node);
      m.redraw();
    }
  });
  workbench.commands.registerCommand({
    id: "close-panel",
    title: "Close Panel",
    action: (ctx: Context, panel?: Panel) => {
      workbench.closePanel(panel || ctx.node.panel);
      workbench.context.panel = workbench.mainPanel;
      m.redraw();
    }
  });
  workbench.commands.registerCommand({
    id: "open",
    title: "Open",
    action: (ctx: Context) => {
      ctx.panel.open(ctx.node);
      workbench.workspace.lastOpenedID = ctx.node.id;
      workbench.workspace.save();
      m.redraw();
    }
  });
  workbench.commands.registerCommand({
    id: "generate-random",
    title: "Generate Random Children",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      [...Array(100)].forEach(() => {
        const node = workbench.workspace.new(generateName(8));
        node.parent = ctx.node;
      });
    }
  });


  workbench.menus.registerMenu("node", [
    {command: "open"},
    {command: "new-panel"},
    {command: "indent"},
    {command: "outdent"},
    {command: "move-up"},
    {command: "move-down"},
    {command: "delete"},
    // {command: "add-checkbox"}, 
    // {command: "remove-checkbox"},
    // {command: "mark-done"},
    // {command: "add-page"},
    // {command: "remove-page"},
    // {command: "generate-random"},
    // {command: "create-reference"},
  ]);

  workbench.menus.registerMenu("settings", [
    {title: () => `${workbench.backend.auth?.currentUser()?.userID()} @ GitHub`, disabled: true, when: () => workbench.authenticated()},
    {title: () => "Login with GitHub", when: () => !workbench.authenticated(), onclick: () => {
      if (!localStorage.getItem("github")) {
        workbench.showNotice("github", () => {
          workbench.backend.auth.login()
        })
      } else {
        workbench.backend.auth.login()
      }
    }},
    {title: () => "Reset Demo", when: () => !workbench.authenticated(), onclick: () => {
      localStorage.clear();
      location.reload();
    }},
    {title: () => "Submit Issue", onclick: () => window.open("https://github.com/treehousedev/treehouse/issues", "_blank")},
    {title: () => "Logout", when: () => workbench.authenticated(), onclick: () => workbench.backend.auth.logout()},
  ]);

  document.addEventListener("keydown", (e) => {
    const binding = workbench.keybindings.evaluateEvent(e);
    if (binding) {
      workbench.commands.executeCommand(binding.command, workbench.context);
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // TODO: find a better way to do this?
    if (e.key === "Escape") {
      if (workbench.curtain && workbench.curtain.onclick) {
        workbench.curtain.onclick(e);
      }
    }
  });


  m.mount(target, {view: () => m(App, {workbench})});
}



function generateName(length = 10) {
  const random = (min: any, max: any) => {
    return Math.round(Math.random() * (max - min) + min)
  };
  const word = () => {
    const words = [
      'got',
      'ability',
      'shop',
      'recall',
      'fruit',
      'easy',
      'dirty',
      'giant',
      'shaking',
      'ground',
      'weather',
      'lesson',
      'almost',
      'square',
      'forward',
      'bend',
      'cold',
      'broken',
      'distant',
      'adjective'
    ];
    return words[random(0, words.length - 1)];
  };
  const words = (length) => (
    [...Array(length)]
        .map((_, i) => word())
        .join(' ')
        .trim()
  );
  return words(random(2, length))
}