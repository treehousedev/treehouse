
import { assertEquals, assert } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { Module, Node } from "./mod.ts";
import { component } from "./components.ts";

Deno.test("node proxy", () => {
  const m = new Module();
  m.import([
    {
      ID: "root",
      Name: "Root",
      Linked: {"Children": ["child"]},
      Attrs: {}
    },
    {
      ID: "child",
      Name: "Child",
      Parent: "root",
      Linked: {},
      Attrs: {}
    }
  ])

  const roots = m.roots();
  assertEquals(roots.length, 2);
 
  const children = roots[1].getChildren();
  assertEquals(children.length, 1);

  assertEquals(children[0].getParent()?.getName(), "Root");
});

Deno.test("child operations", () => {
  const m = new Module();
  const root = m.new("Root");
  const childA = m.new("ChildA");
  const childB = m.new("ChildB");
  const childC = m.new("ChildC");
  const childD = m.new("ChildD");

  childA.setParent(root);
  childB.setParent(root);
  childC.setParent(root);
  childD.setParent(root);
  assertEquals(root.getChildren().length, 4);

  childB.setSiblingIndex(0);
  assertEquals(childB.getSiblingIndex(), 0);
  assertEquals(childA.getSiblingIndex(), 1);

  childC.setParent(childA);
  childD.setParent(childA);
  assertEquals(root.getChildren().length, 2);
  assertEquals(childA.getChildren().length, 2);

  childD.destroy();
  assertEquals(childA.getChildren().length, 1);

});

@component
class Foobar {
  state: string;

  constructor() {
    this.state = "";
  }
}

Deno.test("components", () => {
  const m = new Module();
  const root = m.roots()[0];

  const f = new Foobar();
  f.state = "hello";
  root.addComponent(f);

  assertEquals(root.hasComponent(Foobar), true);

  const ff = root.getComponent(Foobar);
  assertEquals(f, ff);

  root.removeComponent(Foobar);
  assertEquals(root.hasComponent(Foobar), false);

});

Deno.test("new node using path", () => {
  const m = new Module();
  const root = m.getRoot();
  if (!root) {
    assert(root);
    return;
  }

  const child = m.new("Child", true);
  child.setParent(root);

  const sub2 = m.new("Child/Sub1/Sub2");

  assertEquals(sub2.getParent()?.getParent()?.getValue(), true);
})