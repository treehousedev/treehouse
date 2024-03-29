import { Node } from "../model/mod.ts";
import { SHA1 } from "./util.js";

/**
 * Path is a stack of nodes. It can be used as a history stack
 * so you can "zoom" into subnodes and return back to previous nodes.
 * It is also used to identify nodes in the UI more specifically than
 * the node ID since a node can be shown more than once (references, panels, etc).
 */
export class Path {
  name: string;
  nodes: Node[];

  constructor(head?: Node, name?: string) {
    if (name) {
      this.name = name;
    } else {
      this.name = Math.random().toString(36).substring(2);
    }
    if (head) {
      this.nodes = [head];
    } else {
      this.nodes = [];
    }
  }

  push(node: Node) {
    this.nodes.push(node);
  }

  pop(): Node|null {
    return this.nodes.pop() || null;
  }

  sub(): Path {
    return new Path(this.node, this.name);
  }

  clone(): Path {
    const p = new Path();
    p.name = this.name;
    p.nodes = [...this.nodes];
    return p;
  }

  append(node: Node): Path {
    const p = this.clone();
    p.push(node);
    return p;
  }

  get length(): number {
    return this.nodes.length;
  }

  get id(): string {
    return SHA1([this.name, ...this.nodes.map(n => n.id)].join(":"));
  }

  get node(): Node {
    return this.nodes[this.nodes.length-1];
  }

  get previous(): Node|null {
    if (this.nodes.length < 2) return null;
    return this.nodes[this.nodes.length-2];
  }

  get head(): Node {
    return this.nodes[0];
  }
}

