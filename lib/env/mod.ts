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
  currentNode: Node;

  constructor(backend: Store) {
    this.backend = backend;
    this.manifold = new Module();
    const nodes = this.backend.loadAll();
    if (nodes.length === 0) {
      for (const n of Object.values(generateNodeTree(1000))) {
        nodes.push(n);
      }
    }
    this.manifold.import(nodes);
    this.manifold.observers.push((n => {
      this.backend.saveAll(Object.values(this.manifold.nodes));
    }));
    
  }
}