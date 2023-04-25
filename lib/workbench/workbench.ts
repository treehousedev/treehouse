import { Backend } from "../backend/mod.ts";
import { KeyBindings } from "../action/keybinds.ts";
import { CommandRegistry } from "../action/commands.ts";
import { MenuRegistry } from "../action/menus.ts";
import { Node } from "../model/mod.ts";

import { Workspace, Context, Panel } from "./mod.ts";

/**
 * Workbench is the top-level controller for the Treehouse frontend.
 * 
 * It manages the user action registries, open panels, open workspace,
 * user context, and provides an API used by UI components to 
 * trigger various pop-overs, work with quick add, or anything else
 * not provided by the backend or workspace.
 */
export class Workbench {
  commands: CommandRegistry;
  keybindings: KeyBindings;
  menus: MenuRegistry;

  backend: Backend;
  workspace: Workspace;
  
  context: Context;
  panels: Panel[][]; // Panel[row][column]

  menu: any;
  notice: any;
  palette: any;
  quickadd: any;
  curtain: any;

  constructor(backend: Backend) {
    this.commands = new CommandRegistry();
    this.keybindings = new KeyBindings();
    this.menus = new MenuRegistry();

    this.backend = backend;
    this.workspace = new Workspace(backend.files);

    this.context = {node: null};
    this.panels = [[]];
    
  }

  get mainPanel(): Panel {
    return this.panels[0][0];
  }

  async initialize() {
    await this.workspace.load();
    this.workspace.rawNodes.forEach(n => this.backend.index.index(n));
    this.workspace.observe((n => {
      this.workspace.save();
      if (n.isDestroyed) {
        this.backend.index.remove(n.id);
      } else {
        this.backend.index.index(n.raw);
        n.components.forEach(com => this.backend.index.index(com.raw));
      }
    }));
    
    if (this.workspace.lastOpenedID) {
      this.openNewPanel(this.workspace.find(this.workspace.lastOpenedID) || this.workspace.mainNode());
    } else {
      this.openNewPanel(this.workspace.mainNode());
    }
    
    m.redraw();


    if (!localStorage.getItem("firsttime")) {
      this.showNotice('firsttime');
    }
    
  }

  authenticated(): boolean {
    return this.backend.auth && this.backend.auth.currentUser();
  }

  closeQuickAdd() {
    this.quickadd = null;
    m.redraw();
  }

  openQuickAdd() {
    let node = this.workspace.find("@quickadd");
    if (!node) {
      node = this.workspace.new("@quickadd");
    }
    this.quickadd = node;
  }

  commitQuickAdd() {
    const node = this.workspace.find("@quickadd");
    if (!node) return;
    const today = this.todayNode();
    node.getChildren().forEach(n => n.setParent(today));
  }

  clearQuickAdd() {
    const node = this.workspace.find("@quickadd");
    if (!node) return;
    node.getChildren().forEach(n => n.destroy());
  }

  // TODO: goto workspace
  todayNode(): ManfioldNode {
    const today = new Date();
    const dayNode = today.toUTCString().split(today.getFullYear())[0];
    const weekNode = `Week ${String(getWeekOfYear(today)).padStart(2, "0")}`;
    const yearNode = `${today.getFullYear()}`;
    const todayPath = ["@workspace", "Calendar", yearNode, weekNode, dayNode].join("/");
    let todayNode = this.workspace.find(todayPath);
    if (!todayNode) {
      todayNode = this.workspace.new(todayPath);
    }
    return todayNode;
  }

  openToday() {
    this.open(this.todayNode());
  }

  open(n: Node) {
    // TODO: not sure this is still necessary
    if (!this.workspace.expanded[n.id]) {
      this.workspace.expanded[n.id] = {};
    }

    this.workspace.lastOpenedID = n.id;
    this.workspace.save();
    const p = new Panel(n);
    this.panels[0][0] = p
    this.context.panel = p;
  }

  openNewPanel(n: Node) {
    // TODO: not sure this is still necessary
    if (!this.workspace.expanded[n.id]) {
      this.workspace.expanded[n.id] = {};
    }

    this.workspace.lastOpenedID = n.id;
    this.workspace.save();
    const p = new Panel(n);
    this.panels[0].push(p);
    this.context.panel = p;
  }

  closePanel(panel: Panel) {
    this.panels.forEach((row, ridx) => {
      this.panels[ridx] = row.filter(p => p !== panel);
    });
  }

  defocus() {
    this.context.node = null;
  }

  focus(n: Node, panel?: Panel, pos?: number = 0) {
    this.context.node = n;
    if (panel) {
      this.context.panel = panel;
    }
    const input = this.getInput(n, panel);
    if (input) {
      input.focus();
      if (pos !== undefined) {
        input.setSelectionRange(pos,pos);
      }
    }
  }

  getInput(n: Node, panel?: Panel): HTMLElement {
    if (!panel) {
      panel = this.context.panel;
    }
    let id = `input-${panel.id}-${n.id}`;
    // kludge:
    if (n.raw.Rel === "Fields") {
      id = id+"-value"; 
    }
    return document.getElementById(id);
  }

  executeCommand<T>(id: string, ctx: any, ...rest: any): Promise<T> {
    return this.commands.executeCommand(id, this.newContext(ctx), ...rest);
  }

  newContext(ctx: any): Context {
    return Object.assign({}, this.context, ctx);
  }

  showMenu(event: Event, ctx: any) {
    event.stopPropagation();
    event.preventDefault();
    const trigger = event.target.closest("*[data-menu]");
    const rect = trigger.getBoundingClientRect();
    const align = trigger.dataset["align"] || "left";
    let x = document.body.scrollLeft+rect.x;
    if (align === "right") {
      x = document.body.offsetWidth - rect.right;
    }
    const y = document.body.scrollTop+rect.y+rect.height;
    const items = this.menus.menus[trigger.dataset["menu"]];
    const cmds = items.filter(i => i.command).map(i => this.commands.commands[i.command]);
    if (!items) return;
    this.menu = {x, y, 
      ctx: this.newContext(ctx), 
      items: items,
      commands: cmds,
      align: align
    };
    this.curtain = {
      visible: false,
      onclick: () => this.hideMenu()
    }
    m.redraw();
  }

  hideMenu() {
    this.menu = null;
    this.curtain = null;
    m.redraw();
  }

  showPalette(x: number, y: number, ctx: Context) {
    this.palette = {x, y, ctx: ctx};
    this.curtain = {
      visible: false,
      onclick: () => this.hidePalette()
    }
    m.redraw();
  }

  hidePalette() {
    this.palette = null;
    this.curtain = null;
    m.redraw();
  }

  showNotice(message, finished) {
    this.notice = {message, finished};
    m.redraw();
  }

  hideNotice() {
    this.notice = null;
    m.redraw();
  }


}


function getWeekOfYear(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}