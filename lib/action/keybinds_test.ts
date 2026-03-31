
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { KeyBindings } from "./keybinds.ts";

Deno.test("binding registration", async () => {
  const bindings = new KeyBindings();
  bindings.registerBinding({
    command: "test",
    key: "shift+a"
  })
  const ret = bindings.getBinding("test");

  assertEquals(ret?.key, "shift+a");
});

Deno.test("binding evaluation matches meta bindings through ctrl on non-mac runtimes", async () => {
  const bindings = new KeyBindings();
  bindings.registerBinding({
    command: "pick-command",
    key: "meta+k"
  });

  const ret = bindings.evaluateEvent({
    key: "k",
    shiftKey: false,
    ctrlKey: true,
    altKey: false,
    metaKey: false
  } as KeyboardEvent);

  assertEquals(ret?.command, "pick-command");
});
