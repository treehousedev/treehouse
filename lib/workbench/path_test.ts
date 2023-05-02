import { assertEquals, assertNotEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { Path } from "./path.ts";
import { Bus } from "../model/module/mod.ts";

Deno.test("path ids", async () => {
  const b = new Bus();
  const n1 = b.make("Node1");
  const n2 = b.make("Node2");
  const n3 = b.make("Node3");

  const p = new Path(n1);
  const d1 = p.id;
  p.push(n2);
  assertNotEquals(d1, p.id);

  const pA = p.append(n3);
  const pB = p.append(n3);
  assertEquals(pA.id, pB.id);
  
  pA.pop();
  assertNotEquals(pA.id, pB.id);
  pB.pop();
  assertEquals(pA.id, pB.id);

  assertEquals(p.head.name, "Node1");
  assertEquals(p.node.name, "Node2");
});