
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { Module, Node } from "./mod.ts";

Deno.test("node proxy", async () => {
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
  assertEquals(roots.length, 1);
 
  const children = roots[0].getChildren();
  assertEquals(children.length, 1);

  assertEquals(children[0].getParent()?.Name, "Root");
});