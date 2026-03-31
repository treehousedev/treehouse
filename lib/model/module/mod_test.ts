
import { assertEquals, assert, assertExists } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import * as module from "./mod.ts";
import { Node } from "../mod.ts";
import { component } from "../components.ts";

Deno.test("node children", () => {
  const bus = new module.Bus();
  const nodeA = bus.make("@root/NodeA");
  const nodeB = bus.make("@root/NodeB");
  const nodeC = bus.make("@root/NodeC");

  const root = bus.root();
  assertExists(root);
  assertEquals(root.childCount, 3);

  assertEquals(nodeA.siblingIndex, 0);
  assertEquals(nodeB.siblingIndex, 1);
  nodeB.siblingIndex = 0;
  assertEquals(nodeA.siblingIndex, 1);
  assertEquals(nodeB.siblingIndex, 0);

  assertEquals(nodeA.parent?.name, root.name);

});

@component
class Foobar {
  state: string;
  nodes: Node[];

  constructor() {
    this.state = "";
    this.nodes = [];
  }

  onAttach(node: Node) {
    if (!this.nodes.length) {
      const b = node.bus;
      this.nodes.push(b.make("Foo1"));
      this.nodes.push(b.make("Foo2"));
      this.nodes.push(b.make("Foo3"));
    }
  }

  objectChildren(node: Node, children: Node[]): Node[] {
    return this.nodes;
  }
}

Deno.test("components", () => {
  const b = new module.Bus();
  const root = b.root();
  assertExists(root);

  const f = new Foobar();
  f.state = "hello";
  root.addComponent(f);

  assertEquals(root.hasComponent(Foobar), true);

  const ff = root.getComponent(Foobar);
  assertEquals(f, ff);

  root.removeComponent(Foobar);
  assertEquals(root.hasComponent(Foobar), false);

});

Deno.test("references", () => {
  const bus = new module.Bus();
  const a = bus.make("A");
  const b = bus.make("A/B");
  const c = bus.make("A/B/C");

  const x = bus.make("X");
  const r = bus.make("");
  r.refTo = b;
  r.parent = x;
  r.value = "value";

  assertEquals(r.name, b.name);
  assertEquals(r.value, b.value);

  assertEquals(r.path, "X/B");
  assertEquals(r.refTo.path, "A/B");
  
  assertEquals(b.children[0].id, r.refTo.children[0].id);

  const names = ["A", "B", "C"];
  a.walk((n: Node): boolean => {
    assertEquals(n.name, names.shift());
    return false;
  });

});

Deno.test("remove child removes the targeted child only", () => {
  const bus = new module.Bus();
  const parent = bus.make("Parent");
  const childA = bus.make("Parent/ChildA");
  const childB = bus.make("Parent/ChildB");

  assertEquals(parent.children.map(n => n.name), ["ChildA", "ChildB"]);

  parent.removeChild(childA);

  assertEquals(parent.children.map(n => n.name), ["ChildB"]);
});

Deno.test("remove linked removes the targeted linked node only", () => {
  const bus = new module.Bus();
  const parent = bus.make("Parent");
  const fieldA = bus.make("FieldA");
  const fieldB = bus.make("FieldB");

  fieldA.raw.Parent = parent.id;
  fieldB.raw.Parent = parent.id;
  parent.addLinked("Fields", fieldA);
  parent.addLinked("Fields", fieldB);

  assertEquals(parent.getLinked("Fields").map(n => n.name), ["FieldA", "FieldB"]);

  parent.removeLinked("Fields", fieldA);

  assertEquals(parent.getLinked("Fields").map(n => n.name), ["FieldB"]);
});
