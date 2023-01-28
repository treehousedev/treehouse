
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { KeyBindings } from "./keybinds.ts";

Deno.test("binding registration", async () => {
  const bindings = new KeyBindings();
  bindings.registerBinding({
    command: "test",
    key: "shift+a"
  })
  const ret = bindings.bindings["test"];

  assertEquals(ret.key, "shift+a");
});