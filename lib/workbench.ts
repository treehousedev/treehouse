import { Backend } from "./backend/mod.ts";
import { KeyBindings } from "./action/keybinds.ts";
import { CommandRegistry } from "./action/commands.ts";
import { Module, Node as ManifoldNode } from "./manifold/mod.ts";
import { MenuRegistry } from "./action/menus.ts";


export interface Context {
  node: Node|null;
  nodes?: Node[];
  event?: Event;
}

export class Panel {
  id: string;
  history: Node[];

  constructor(node: ManifoldNode) {
    node.panel = this;
    this.id = Math.random().toString(36).substring(2);
    this.history = [node];
  }

  get current(): Node {
    return this.history[this.history.length-1];
  }
}

export function panelNode(node: ManifoldNode, panel: Panel): Node {
  node.panel = panel;
  return node;
}

export interface Node extends ManifoldNode {
  panel: Panel;
}

export class Workbench {
  commands: CommandRegistry;
  keybindings: KeyBindings;
  menus: MenuRegistry;

  backend: Backend;
  nodes: Module;

  context: Context;

  panels: Panel[][]; // Panel[row][column]
  menu: any;
  notice: any;
  palette: any;
  quickadd: any;
  curtain: any;

  expanded: {[key: string]: {[key: string]: boolean}}; // [rootid][id]

  constructor(backend: Backend) {
    this.commands = new CommandRegistry();
    this.keybindings = new KeyBindings();
    this.menus = new MenuRegistry();

    this.backend = backend;
    this.nodes = new Module();
    this.context = {node: null};
    this.panels = [[]];
  
    const expanded = localStorage.getItem(this.expandedStorageKey);
    if (expanded) {
      this.expanded = JSON.parse(expanded);
    } else {
      this.expanded = {};
    }
  }

  async initialize() {
    const nodes = await this.backend.nodes.loadAll();
    const root = this.nodes.find("@root");
    if (nodes.length === 0) {
      const ws = this.nodes.new("@workspace");
      ws.setName("Workspace");
      ws.setParent(root);
      const cal = this.nodes.new("@calendar");
      cal.setName("Calendar");
      cal.setParent(ws);
      const home = this.nodes.new("Home");
      home.setParent(ws);
    }
    this.nodes.import(nodes);
    
    this.nodes.observers.push((n => {
      this.backend.nodes.saveAll(Object.values(this.nodes.nodes));
    
      this.backend.index.index(n.raw);
      n.getComponentNodes().forEach(com => this.backend.index.index(com.raw));
    
    }));
    Object.values(this.nodes.nodes).forEach(n => this.backend.index.index(n));  

    let ws = this.nodes.find("@workspace");
    if (!ws) {
      console.warn("@workspace not found, attempting to migrate @root/Workspace");
      ws = this.nodes.find("@root/Workspace");
      console.log("found @root/Workspace, migrating...");
      // temporary migration. remove eventually. soon.
      if (ws && ws.raw.ID !== "@workspace") {
        root.raw.Linked.Children = ["@workspace"];
        ws.getChildren().forEach(n => {
          n.raw.Parent = "@workspace";
        });
        const raw = ws.raw;
        const oldID = raw.ID;
        raw.ID = "@workspace";
        this.nodes.nodes["@workspace"] = raw;
        delete this.nodes.nodes[oldID];
        ws = this.nodes.find("@workspace");
      }
      console.log("migrated");
    }
    if (!ws) {
      console.warn("no suitable workspace found, using @root");
      ws = root;
    }
    this.openNewPanel(ws);

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
    let node = this.nodes.find("@quickadd");
    if (!node) {
      node = this.nodes.new("@quickadd");
    }
    this.quickadd = node;
  }

  commitQuickAdd() {
    const node = this.nodes.find("@quickadd");
    if (!node) return;
    const today = this.todayNode();
    node.getChildren().forEach(n => n.setParent(today));
  }

  clearQuickAdd() {
    const node = this.nodes.find("@quickadd");
    if (!node) return;
    node.getChildren().forEach(n => n.destroy());
  }

  todayNode(): ManfioldNode {
    const today = new Date();
    const dayNode = today.toUTCString().split(today.getFullYear())[0];
    const weekNode = `Week ${String(getWeekOfYear(today)).padStart(2, "0")}`;
    const yearNode = `${today.getFullYear()}`;
    const todayPath = ["@workspace", "Calendar", yearNode, weekNode, dayNode].join("/");
    let todayNode = this.nodes.find(todayPath);
    if (!todayNode) {
      todayNode = this.nodes.new(todayPath);
    }
    return todayNode;
  }

  openToday() {
    this.open(this.todayNode());
  }

  open(n: ManifoldNode) {
    if (!this.expanded[n.ID]) {
      this.expanded[n.ID] = {};
    }
    localStorage.setItem("lastopen", n.ID);
    this.panels[0][0] = new Panel(n);
  }

  openNewPanel(n: ManifoldNode) {
    if (!this.expanded[n.ID]) {
      this.expanded[n.ID] = {};
    }
    localStorage.setItem("lastopen", n.ID);
    const p = new Panel(n);
    this.panels[0].push(p);
  }

  closePanel(panel: Panel) {
    this.panels.forEach((row, ridx) => {
      this.panels[ridx] = row.filter(p => p !== panel);
    });
  }

  focus(n: Node, pos: number = 0) {
    this.context.node = n;
    if (n) {
      document.getElementById(`input-${n.panel?.id}-${n.ID}`)?.focus();
      document.getElementById(`input-${n.panel?.id}-${n.ID}`)?.setSelectionRange(pos,pos);
    }
  }

  getInput(n: Node): HTMLElement {
    return document.getElementById(`input-${n.panel?.id}-${n.ID}`);
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
      x = window.innerWidth - rect.right - rect.width;
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

  getExpanded(n: Node): boolean {
    let root = n.ID;
    if (n.panel) {
      root = n.panel.history[0].ID
    }
    if (!this.expanded[root]) {
      this.expanded[root] = {};
    }
    let expanded = this.expanded[root][n.ID];
    if (expanded === undefined) {
      expanded = false;
    }
    return expanded;
  }

  setExpanded(n: Node, b: boolean) {
    this.expanded[n.panel.history[0].ID][n.ID] = b;
    localStorage.setItem(this.expandedStorageKey, JSON.stringify(this.expanded));
  }

  get expandedStorageKey(): string {
    if (this.authenticated()) {
      return `treehouse-expanded-${this.backend.auth.currentUser().userID()}`;
    } else {
      return `treehouse-expanded`;
    }
  }

  findAbove(n: Node): Node|null {
    if (n.ID === n.panel.current.ID) {
      return null;
    }
    const panel = n.panel;
    let above = n.getPrevSibling();
    if (!above) {
      return panelNode(n.getParent(), panel);
    }
    const lastChildIfExpanded = (n: Node): Node => {
      const expanded = this.getExpanded(panelNode(n, panel));
      if (!expanded || n.childCount() === 0) {
        return n;
      }
      const lastChild = n.getChildren()[n.childCount() - 1];
      return lastChildIfExpanded(lastChild);
    }
    return panelNode(lastChildIfExpanded(above), panel);
  }

  findBelow(n: Node): Node|null {
    // TODO: find a way to indicate pseudo "new" node for expanded leaf nodes
    const panel = n.panel;
    if (this.getExpanded(n) && n.childCount() > 0) {
      return panelNode(n.getChildren()[0], panel);
    }
    const nextSiblingOrParentNextSibling = (n: Node): Node|null => {
      const below = n.getNextSibling();
      if (below) {
        return panelNode(below, panel);
      }
      const parent = n.getParent();
      if (!parent || parent.ID === panel.current.ID) {
        return null;
      }
      return nextSiblingOrParentNextSibling(parent);
    }
    return nextSiblingOrParentNextSibling(n);
  }

}


function getWeekOfYear(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}