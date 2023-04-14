
import { assertEquals, assert, assertExists } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import * as module from "./module.ts";
import { component } from "./components.ts";

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

  constructor() {
    this.state = "";
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
