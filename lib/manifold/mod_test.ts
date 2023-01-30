
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { Module, Node } from "./mod.ts";

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