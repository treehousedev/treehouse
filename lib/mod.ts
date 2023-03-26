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
import { Workbench } from "./workbench.ts";
import { App } from "./ui/app.tsx";
import { Backend } from "./backend/mod.ts";
import { component } from "./manifold/components.ts";

export { BrowserBackend, SearchIndex_MiniSearch} from "./backend/browser.ts";
export { GitHubBackend } from "./backend/github.ts";

@component
export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }
}

@component
export class Page {
  markdown: string;

  constructor() {
    this.markdown = "";
  }
}

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
      const prev = ctx.node.getPrevSibling();
      if (prev !== null) {
        ctx.node.setParent(prev);
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
      const parent = ctx.node.getParent();
      if (parent !== null && parent.ID !== "@root") {
        ctx.node.setParent(parent.getParent());
        ctx.node.setSiblingIndex(parent.getSiblingIndex()+1);
        if (parent.childCount() === 0) {
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
      const parent = node.getParent();
      if (parent !== null && parent.ID !== "@root") {
        const children = parent.childCount();
        if (node.getSiblingIndex() === 0) {
          if (!parent.getPrevSibling()) {
            return;
          }
          const parentSib = parent.getPrevSibling();
          node.setParent(parentSib);
          node.setSiblingIndex(parentSib.childCount()-1);
          workbench.workspace.setExpanded(ctx.panel.headNode, parentSib, true);
          m.redraw.sync();
          workbench.focus(node);
        } else {
          if (children === 1) {
            return;
          }
          node.setSiblingIndex(node.getSiblingIndex()-1);
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
      const parent = node.getParent();
      if (parent !== null && parent.ID !== "@root") {
        const children = parent.childCount();
        if (node.getSiblingIndex() === children-1) {
          if (!parent.getNextSibling()) {
            return;
          }
          const parentSib = parent.getNextSibling();
          node.setParent(parentSib);
          node.setSiblingIndex(0);
          workbench.workspace.setExpanded(ctx.panel.headNode, parentSib, true);
          m.redraw.sync();
          workbench.focus(node);
        } else {
          if (children === 1) {
            return;
          }
          node.setSiblingIndex(node.getSiblingIndex()+1);
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
      node.setParent(ctx.node);
      if (siblingIndex !== undefined) {
        node.setSiblingIndex(siblingIndex);
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
      node.setParent(ctx.node.getParent());
      node.setSiblingIndex(ctx.node.getSiblingIndex());
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
      node.setParent(ctx.node.getParent());
      node.setSiblingIndex(ctx.node.getSiblingIndex()+1);
      m.redraw.sync();
      workbench.focus(node, ctx.panel);
    }
  });
  workbench.keybindings.registerBinding({command: "insert", key: "shift+enter"});
  workbench.commands.registerCommand({
    id: "delete",
    title: "Delete node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.node.ID.startsWith("@")) return;
      const above = workbench.workspace.findAbove(ctx.panel.headNode, ctx.node);
      ctx.node.destroy();
      m.redraw.sync();
      if (above) {
        let pos = 0;
        if (ctx.event && ctx.event.key === "Backspace") {
          pos = above.getName().length;
        }
        if (above.childCount() === 0) {
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
      workbench.workspace.lastOpenedID = ctx.node.ID;
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
        node.setParent(ctx.node);
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
    {command: "mark-done"},
    {command: "add-page"},
    // {command: "remove-page"},
    {command: "generate-random"},
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