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
import { Path, Workbench } from "./workbench/mod.ts";
import { App } from "./ui/app.tsx";
import { Backend } from "./backend/mod.ts";
import { CodeBlock } from "./com/codeblock.tsx";
import { InlineFrame } from "./com/iframe.tsx";
import { SmartNode } from "./com/smartnode.tsx";
import { Checkbox } from "./com/checkbox.tsx";
import { TextField } from "./com/textfield.tsx";
import { Clock } from "./com/clock.tsx";
import { Tag } from "./com/tag.tsx";
import { Template } from "./com/template.tsx";
import { Document } from "./com/document.tsx";
import { Description } from "./com/description.tsx";
import { objectManaged } from "./model/hooks.ts";

export { BrowserBackend, SearchIndex_MiniSearch } from "./backend/browser.ts";
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

  // TODO: better way to initialize components? 
  [
    Clock,
    TextField,
    Document,
    Checkbox,
    Tag,
    Template,
    SmartNode,
    Description,
    InlineFrame,
    CodeBlock,
  ].forEach(com => {
    if (com.initialize) {
      com.initialize(workbench);
    }
  });


  // pretty specific to github backend right now
  document.addEventListener("BackendError", () => {
    workbench.showNotice("lockstolen", () => {
      location.reload();
    });
  });

  workbench.commands.registerCommand({
    id: "cut",
    title: "Cut",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      
      // no text is selected
      const input = workbench.getInput(ctx.path);
      if (input && input.selectionStart === input.selectionEnd) {
        return true;
      }

      // builtin copy is being performed,
      // clear clipboard so it doesn't override on paste
      workbench.clipboard = undefined;

      return false;
    },
    action: (ctx: Context) => {
      workbench.clipboard = {op: "cut", node: ctx.node};
    }
  });
  workbench.keybindings.registerBinding({ command: "cut", key: "meta+x" });

  workbench.commands.registerCommand({
    id: "copy",
    title: "Copy",
    when: (ctx: Context) => {
      if (!ctx.node) return false;

      // no text is selected
      const input = workbench.getInput(ctx.path);
      if (input && input.selectionStart === input.selectionEnd) {
        return true;
      }

      // builtin copy is being performed,
      // clear clipboard so it doesn't override on paste
      workbench.clipboard = undefined;

      return false;
    },
    action: (ctx: Context) => {
      workbench.clipboard = {op: "copy", node: ctx.node};
    }
  });
  workbench.keybindings.registerBinding({ command: "copy", key: "meta+c" });

  workbench.commands.registerCommand({
    id: "copy-reference",
    title: "Copy as Reference",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      
      // no text is selected
      const input = workbench.getInput(ctx.path);
      if (input && input.selectionStart === input.selectionEnd) {
        return true;
      }

      // builtin copy is being performed,
      // clear clipboard so it doesn't override on paste
      workbench.clipboard = undefined;

      return false;
    },
    action: (ctx: Context) => {
      workbench.clipboard = {op: "copyref", node: ctx.node};
    }
  });
  workbench.keybindings.registerBinding({ command: "copy-reference", key: "shift+ctrl+c" });

  workbench.commands.registerCommand({
    id: "paste",
    title: "Paste",
    when: (ctx: Context) => {
      if (workbench.clipboard) {
        return true;
      }
      return false;
    },
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return;
      switch (workbench.clipboard.op) {
        case "copy":
          workbench.clipboard.node = workbench.clipboard.node.duplicate();
          break;
        case "copyref":
          const ref = workbench.workspace.new("");
          ref.refTo = workbench.clipboard.node;
          workbench.clipboard.node = ref;
          break;
      }
      if (workbench.clipboard.node.raw.Rel === "Fields") {
        workbench.clipboard.node.raw.Parent = ctx.node.parent.id;
        ctx.node.parent.addLinked("Fields", workbench.clipboard.node);
      } else {
        workbench.clipboard.node.parent = ctx.node.parent;
        workbench.clipboard.node.siblingIndex = ctx.node.siblingIndex;    
      }
      m.redraw.sync();
      const p = ctx.path.clone();
      p.pop();
      workbench.focus(p.append(workbench.clipboard.node));
      if (workbench.clipboard.op === "cut") {
        workbench.clipboard = undefined;
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "paste", key: "meta+v" });



  workbench.commands.registerCommand({
    id: "view-list",
    title: "View as List",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      ctx.node.setAttr("view", "list");
    }
  });

  workbench.commands.registerCommand({
    id: "view-table",
    title: "View as Table",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      ctx.node.setAttr("view", "table");
      ctx.node.children.forEach(child => {
        workbench.workspace.setExpanded(ctx.path.head, child, false);
      });
    }
  });

  workbench.commands.registerCommand({
    id: "view-tabs",
    title: "View as Tabs",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      ctx.node.setAttr("view", "tabs");
    }
  });

  workbench.commands.registerCommand({
    id: "view-cards",
    title: "View as Cards",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      ctx.node.setAttr("view", "cards");
    }
  });


  workbench.commands.registerCommand({
    id: "add-checkbox",
    title: "Add checkbox",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.hasComponent(Checkbox)) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      const checkbox = new Checkbox();
      ctx.node.addComponent(checkbox);
    }
  });

  workbench.commands.registerCommand({
    id: "remove-checkbox",
    title: "Remove checkbox",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      if (ctx.node.hasComponent(Checkbox)) return true;
      return false;
    },
    action: (ctx: Context) => {
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
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return;
      const path = ctx.path.clone();
      path.pop(); // drop node
      const field = workbench.workspace.new(ctx.node.name, "");
      field.raw.Parent = ctx.node.parent.id;
      const text = new TextField();
      field.addComponent(text);
      ctx.node.parent.addLinked("Fields", field);
      path.push(field);
      ctx.node.destroy();
      m.redraw.sync();
      workbench.focus(path);
    }
  });

  workbench.commands.registerCommand({
    id: "mark-done",
    title: "Mark Done",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
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
  workbench.keybindings.registerBinding({ command: "mark-done", key: "meta+enter" });



  workbench.commands.registerCommand({
    id: "expand",
    title: "Expand",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workbench.workspace.setExpanded(ctx.path.head, ctx.node, true);
      m.redraw();
    }
  });
  workbench.keybindings.registerBinding({ command: "expand", key: "meta+arrowdown" });
  workbench.commands.registerCommand({
    id: "collapse",
    title: "Collapse",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      workbench.workspace.setExpanded(ctx.path.head, ctx.node, false);
      m.redraw();
    }
  });
  workbench.keybindings.registerBinding({ command: "collapse", key: "meta+arrowup" });
  workbench.commands.registerCommand({
    id: "indent",
    title: "Indent",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      const node = ctx.node; // redraw seems to unset ctx.node
      const path = ctx.path.clone();
      let prev = node.prevSibling;
      while (prev && objectManaged(prev)) {
        prev = prev.prevSibling;
        if (!prev) return;
      }
      if (prev !== null) {
        path.pop(); // drop node
        path.push(prev);
        node.parent = prev;
        path.push(node);
        workbench.workspace.setExpanded(ctx.path.head, prev, true);
        m.redraw.sync();
        workbench.focus(path);
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "indent", key: "tab" });
  workbench.commands.registerCommand({
    id: "outdent",
    title: "Outdent",
    when: (ctx: Context) => {
      if (!ctx.node) return false;
      if (ctx.node.raw.Rel === "Fields") return false;
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return false;
      if (ctx.node.parent && ctx.node.parent.hasComponent(Document)) return false;
      return true;
    },
    action: (ctx: Context) => {
      const node = ctx.node; // redraw seems to unset ctx.node
      const parent = ctx.path.previous;
      const path = ctx.path.clone();
      if (parent !== null && parent.id !== "@root" && parent.id !== workbench.workspace.lastOpenedID) {
        path.pop(); // drop node
        path.pop(); // drop parent
        node.parent = parent.parent;
        path.push(node);
        node.siblingIndex = parent.siblingIndex + 1;
        if (parent.childCount === 0 && parent.getLinked("Fields").length === 0) {
          workbench.workspace.setExpanded(ctx.path.head, parent, false);
        }
        m.redraw.sync();
        workbench.focus(path);
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "outdent", key: "shift+tab" });
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
          const p = ctx.path.clone();
          p.pop(); // drop node
          p.pop(); // drop parent
          let parentSib = parent.prevSibling;
          while (parentSib && objectManaged(parentSib)) {
            parentSib = parentSib.prevSibling;
            if (!parentSib) return;
          }
          p.push(parentSib);
          p.push(node);
          node.parent = parentSib;
          node.siblingIndex = parentSib.childCount - 1;
          workbench.workspace.setExpanded(ctx.path.head, parentSib, true);
          m.redraw.sync();
          workbench.focus(p);
        } else {
          if (children === 1) {
            return;
          }
          node.siblingIndex = node.siblingIndex - 1;
          m.redraw.sync();
        }
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "move-up", key: "shift+meta+arrowup" });
  workbench.commands.registerCommand({
    id: "move-down",
    title: "Move Down",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const node = ctx.node; // redraw seems to unset ctx.node
      const parent = node.parent;
      if (parent !== null && parent.id !== "@root") {
        const children = parent.childCount;
        // if last child
        if (node.siblingIndex === children - 1) {
          if (!parent.nextSibling) {
            return;
          }
          const p = ctx.path.clone();
          p.pop(); // drop node
          p.pop(); // drop parent
          let parentSib = parent.nextSibling;
          while (parentSib && objectManaged(parentSib)) {
            parentSib = parentSib.nextSibling;
            if (!parentSib) return;
          }
          p.push(parentSib);
          p.push(node);
          node.parent = parentSib;
          node.siblingIndex = 0;
          workbench.workspace.setExpanded(ctx.path.head, parentSib, true);
          m.redraw.sync();
          workbench.focus(p);
        } else {
          if (children === 1) {
            return;
          }
          node.siblingIndex = node.siblingIndex + 1;
          m.redraw.sync();
        }
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "move-down", key: "shift+meta+arrowdown" });
  workbench.commands.registerCommand({
    id: "insert-child",
    title: "Insert Child",
    action: (ctx: Context, name: string = "", siblingIndex?: number) => {
      if (!ctx.node) return;
      if (objectManaged(ctx.node)) return;
      const node = workbench.workspace.new(name);
      node.parent = ctx.node;
      if (siblingIndex !== undefined) {
        node.siblingIndex = siblingIndex;
      }
      workbench.workspace.setExpanded(ctx.path.head, ctx.node, true);
      m.redraw.sync();
      workbench.focus(ctx.path.append(node), name.length);
    }
  });
  workbench.commands.registerCommand({
    id: "insert-before",
    title: "Insert Before",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return;
      const node = workbench.workspace.new("");
      node.parent = ctx.node.parent;
      node.siblingIndex = ctx.node.siblingIndex;
      m.redraw.sync();
      const p = ctx.path.clone();
      p.pop();
      workbench.focus(p.append(node));
    }
  });
  workbench.commands.registerCommand({
    id: "insert",
    title: "Insert Node",
    action: (ctx: Context, name: string = "") => {
      if (!ctx.node) return;
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return;
      const node = workbench.workspace.new(name);
      node.parent = ctx.node.parent;
      node.siblingIndex = ctx.node.siblingIndex + 1;
      m.redraw.sync();
      const p = ctx.path.clone();
      p.pop();
      workbench.focus(p.append(node));
    }
  });
  workbench.keybindings.registerBinding({ command: "insert", key: "shift+enter" });
  workbench.commands.registerCommand({
    id: "create-reference",
    title: "Create Reference",
    action: (ctx: Context) => {
      // TODO: prevent creating reference to reference
      if (!ctx.node) return;
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return;
      const node = workbench.workspace.new("");
      node.parent = ctx.node.parent;
      node.siblingIndex = ctx.node.siblingIndex + 1;
      node.refTo = ctx.node;
      m.redraw.sync();
      const p = ctx.path.clone();
      p.pop();
      workbench.focus(p.append(node));
    }
  });
  workbench.commands.registerCommand({
    id: "delete",
    title: "Delete Node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      if (ctx.node.id.startsWith("@")) return;
      if (ctx.path.previous && objectManaged(ctx.path.previous)) return; // should probably provide feedback or disable delete
      const above = workbench.workspace.findAbove(ctx.path);
      ctx.node.destroy();
      m.redraw.sync();
      if (above) {
        let pos = 0;
        if (ctx.event && ctx.event.key === "Backspace") {
          if (above.node.value) {
            pos = above.node.value.length;
          } else {
            pos = above.node.name.length;
          }
        }
        if (above.node.childCount === 0) {
          // TODO: use subCount
          workbench.workspace.setExpanded(ctx.path.head, above.node, false);
        }
        workbench.focus(above, pos);
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "delete", key: "shift+meta+backspace" });
  workbench.commands.registerCommand({
    id: "prev",
    title: "Previous Node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const above = workbench.workspace.findAbove(ctx.path);
      if (above) {
        workbench.focus(above);
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "prev", key: "arrowup" });
  workbench.commands.registerCommand({
    id: "next",
    title: "Next Node",
    action: (ctx: Context) => {
      if (!ctx.node) return;
      const below = workbench.workspace.findBelow(ctx.path);
      if (below) {
        workbench.focus(below);
      }
    }
  });
  workbench.keybindings.registerBinding({ command: "next", key: "arrowdown" });
  workbench.commands.registerCommand({
    id: "pick-command",
    title: "Command Palette",
    hidden: true,
    when: (ctx: Context) => {
      if (workbench.isDialogOpen()) return false;
      return true;
    },
    action: (ctx: Context) => {
      let node = ctx.node;
      let path = ctx.path;
      let posBelow = false;
      if (!node) {
        // no node is selected, use panel node
        node = ctx.path.head;
        path = new Path(ctx.path.head, ctx.path.name);
        posBelow = true;
      }
      const trigger = workbench.getInput(path);
      const rect = trigger.getBoundingClientRect();
      let x = document.body.scrollLeft + rect.x + (trigger.selectionStart * 10) + 20;
      let y = document.body.scrollTop + rect.y - 8;
      if (trigger.coordsAtCursor) {
        x = trigger.coordsAtCursor.left-17;
        y = trigger.coordsAtCursor.top-16;
      }
      if (posBelow) {
        x = document.body.scrollLeft + rect.x;
        y = document.body.scrollTop + rect.y + rect.height;
      }
      workbench.showPalette(x, y, workbench.newContext({ node }));
    }
  });
  workbench.keybindings.registerBinding({ command: "pick-command", key: "meta+k" });
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
    action: (ctx: Context, panel?: Path) => {
      workbench.closePanel(panel || ctx.path);
      workbench.context.path = workbench.mainPanel;
      m.redraw();
    }
  });
  workbench.commands.registerCommand({
    id: "zoom",
    title: "Open",
    action: (ctx: Context) => {
      workbench.workspace.lastOpenedID = ctx.node.id;
      workbench.workspace.save();
      workbench.context.path = ctx.path.append(ctx.node);
      workbench.panels[0] = workbench.context.path;
      m.redraw();
    }
  });
  workbench.commands.registerCommand({
    id: "generate-random",
    hidden: true,
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
    { command: "zoom" },
    { command: "new-panel" },
    { command: "cut" },
    { command: "copy" },
    { command: "paste" },
    { command: "indent" },
    { command: "outdent" },
    { command: "move-up" },
    { command: "move-down" },
    { command: "delete" },
    // {command: "add-checkbox"}, 
    // {command: "remove-checkbox"},
    // {command: "mark-done"},
    // {command: "add-page"},
    // {command: "remove-page"},
    // {command: "generate-random"},
    // {command: "create-reference"},
  ]);

  workbench.menus.registerMenu("settings", [
    { title: () => `${workbench.backend.auth?.currentUser()?.userID()} @ GitHub`, disabled: true, when: () => workbench.authenticated() },
    {
      title: () => "Login with GitHub", when: () => !workbench.authenticated(), onclick: () => {
        if (!localStorage.getItem("github")) {
          workbench.showNotice("github", () => {
            workbench.backend.auth.login()
          })
        } else {
          workbench.backend.auth.login()
        }
      }
    },
    {
      title: () => "Reset Demo", when: () => !workbench.authenticated(), onclick: () => {
        localStorage.clear();
        location.reload();
      }
    },
    { title: () => "Settings", onclick: () => workbench.showSettings() },
    { title: () => "Documentation", onclick: () => window.open("https://treehouse.sh/docs/user", "_blank") },
    { title: () => "Submit Issue", onclick: () => window.open("https://github.com/treehousedev/treehouse/issues", "_blank") },
    { title: () => "Logout", when: () => workbench.authenticated(), onclick: () => workbench.backend.auth.logout() },
  ]);

  document.addEventListener("keydown", (e) => {
    const binding = workbench.keybindings.evaluateEvent(e);
    if (binding && workbench.canExecuteCommand(binding.command, workbench.context)) {
      workbench.executeCommand(binding.command, workbench.context);
      e.stopPropagation();
      e.preventDefault();
      return;
    }
  });


  m.mount(target, { view: () => m(App, { workbench }) });
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
