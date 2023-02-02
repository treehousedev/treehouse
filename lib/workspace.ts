import { Store } from "./backend.ts";
import { KeyBindings } from "./keybinds.ts";
import { CommandRegistry } from "./commands.ts";
import { Module, Node as ManifoldNode, generateNodeTree } from "./manifold/mod.ts";
import { MenuRegistry } from "./menus.ts";


export interface Context {
  node: Node|null;
  nodes?: Node[];
}

export class Panel {
  id: string;
  history: Node[];

  constructor(node: ManifoldNode) {
    node.panel = this;
    this.id = Math.random().toString(36).substring(2);
    this.history = [node];
  }
}

export function panelNode(node: ManifoldNode, panel: Panel): Node {
  node.panel = panel;
  return node;
}

export interface Node extends ManifoldNode {
  panel: Panel;
}

export class Workspace {
  commands: CommandRegistry;
  keybindings: KeyBindings;
  menus: MenuRegistry;

  backend: Store;
  nodes: Module;

  context: Context;

  panels: Panel[][]; // Panel[row][column]
  menu: any;
  palette: any;
  quickadd: any;
  expanded: {[key: string]: {[key: string]: boolean}}; // [rootid][id]

  constructor(backend: Store) {
    this.commands = new CommandRegistry();
    this.keybindings = new KeyBindings();
    this.menus = new MenuRegistry();

    this.backend = backend;
    this.nodes = new Module();
    const nodes = this.backend.loadAll();
    const root = this.nodes.find("@root");
    if (nodes.length === 0) {
      const ws = this.nodes.new("Workspace");
      ws.setParent(root);
      const cal = this.nodes.new("Calendar");
      cal.setParent(ws);
      const home = this.nodes.new("Home");
      home.setParent(ws);
      const random = this.nodes.new("Random");
      random.setParent(ws);
      for (const n of Object.values(generateNodeTree(1000))) {
        if (n.Parent === undefined) {
          n.Parent = random.ID;
          random.raw.Linked.Children.push(n.ID);
        }
        nodes.push(n);
      }
    }
    this.nodes.import(nodes);
    this.nodes.observers.push((n => {
      this.backend.saveAll(Object.values(this.nodes.nodes));
    }));
    this.context = {node: null};
    this.panels = [[]];
    this.expanded = {};

    this.openNewPanel(root?.getChildren()[0]);
  
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
    const todayPath = ["Workspace", "Calendar", yearNode, weekNode, dayNode].join("/");
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
    this.panels[0][0] = new Panel(n);
  }

  openNewPanel(n: ManifoldNode) {
    this.expanded[n.ID] = {};
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
      //document.getElementById(`input-${n.panel.id}-${n.ID}`)?.focus();
      //document.getElementById(`input-${n.panel.id}-${n.ID}`)?.setSelectionRange(pos,pos);
    }
  }

  getInput(n: Node): HTMLElement {
    return document.getElementById(`input-${n.panel.id}-${n.ID}`);
  }

  executeCommand<T>(id: string, ctx: any, ...rest: any): Promise<T> {
    return this.commands.executeCommand(id, this.newContext(ctx), ...rest);
  }

  newContext(ctx: any): Context {
    return Object.assign({}, this.context, ctx);
  }

  showMenu(id: string, x: number, y: number, ctx: any) {
    const items = this.menus.menus[id];
    if (!items) return;
    this.menu = {x, y, 
      ctx: this.newContext(ctx), 
      items: items.map(i => Object.assign(this.commands.commands[i.command], this.keybindings.getBinding(i.command)))
    };
    m.redraw();
  }

  hideMenu() {
    this.menu = null;
    m.redraw();
  }

  showPalette(x: number, y: number, ctx: Context) {
    this.palette = {x, y, ctx: ctx};
    m.redraw();
  }

  hidePalette() {
    this.palette = null;
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
  }
}


function getWeekOfYear(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  var dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}