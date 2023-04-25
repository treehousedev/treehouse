import { Node } from "../model/mod.ts";

/**
 * Panel is a container for viewing an open node. It also has a history
 * stack so you can "zoom" into subnodes and return back to previous nodes.
 * The original node the panel was opened for is the headNode.
 */
export class Panel {
  id: string;
  history: Node[];

  constructor(head: Node) {
    this.id = Math.random().toString(36).substring(2);
    this.history = [head];
  }

  open(node: Node) {
    this.history.push(node);
  }

  back() {
    this.history.pop();
  }

  get currentNode(): Node {
    return this.history[this.history.length-1];
  }

  get headNode(): Node {
    return this.history[0];
  }
}