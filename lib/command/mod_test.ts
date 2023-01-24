
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { CommandRegistry } from "./mod.ts";

Deno.test("command registration and execution", async () => {
  const r = new CommandRegistry();
  r.registerCommand({
    id: "test",
    action: async (msg: string) => {
      return msg
    }
  })
  const ret = await r.executeCommand<string>("test", "Hello world");

  assertEquals(ret, "Hello world");
});