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
    this.workspace = new Workspace(backend);
    this.commands = new CommandRegistry();
    this.keybindings = new KeyBindings();
    this.menus = new MenuRegistry();
  }
}

export class Workspace {
  backend: Store;
  manifold: Module;

  // context
  currentNode: Node|null;

  //showMenu
  //menu

  constructor(backend: Store) {
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
    
  }

  setCurrentNode(n: Node|null, pos: number = 0) {
    this.currentNode = n;
    if (n) {
      document.getElementById(`input-${n.ID}`)?.focus();
      document.getElementById(`input-${n.ID}`)?.setSelectionRange(pos,pos);
    }
  }
}