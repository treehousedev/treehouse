import { Store } from "../backend/mod.ts";
import { KeyBindings } from "../command/keybindings/mod.ts";
import { CommandRegistry } from "../command/mod.ts";
import { Module, Node, generateNodeTree } from "../manifold/mod.ts";
import { MenuRegistry } from "../menu/mod.ts";


export class Environment {
  workspace: Workspace;
  commands: CommandRegistry;
  keybindings: KeyBindings;
  menus: MenuRegistry;

  constructor(backend: Store) {
    this.workspace = new Workspace(this, backend);
    this.commands = new CommandRegistry();
    this.keybindings = new KeyBindings();
    this.menus = new MenuRegistry();
  }
}

export interface Context {
  node: Node|null;
  nodes?: Node[];
}

export class Workspace {
  backend: Store;
  manifold: Module;
  env: Environment;

  context: Context;

  menu: any;

  constructor(env: Environment, backend: Store) {
    this.env = env;
    this.backend = backend;
    this.manifold = new Module();
    const nodes = this.backend.loadAll();
    const root = this.manifold.find("@root");
    if (nodes.length === 0) {
      for (const n of Object.values(generateNodeTree(1000))) {
        if (n.Parent === undefined) {
          n.Parent = "@root";
          root?.raw.Linked.Children.push(n.ID);
        }
        nodes.push(n);
      }
    }
    this.manifold.import(nodes);
    this.manifold.observers.push((n => {
      this.backend.saveAll(Object.values(this.manifold.nodes));
    }));
    this.context = {node: null};
  }

  setCurrentNode(n: Node|null, pos: number = 0) {
    this.context.node = n;
    if (n) {
      document.getElementById(`input-${n.ID}`)?.focus();
      document.getElementById(`input-${n.ID}`)?.setSelectionRange(pos,pos);
    }
  }

  getContext(ctx: any): Context {
    return Object.assign({}, this.context, ctx);
  }

  showMenu(id: string, x: number, y: number, ctx: Context) {
    const items = this.env.menus.menus[id];
    if (!items) return;
    this.menu = {x, y, ctx: ctx, items: items.map(i => Object.assign(this.env.commands.commands[i.command], this.env.keybindings.getBinding(i.command)))};
    m.redraw();
  }

  hideMenu() {
    this.menu = null;
    m.redraw();
  }
}