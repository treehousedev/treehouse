
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { MenuRegistry } from "./mod.ts";

Deno.test("menu registration", async () => {
  const menus = new MenuRegistry();
  menus.registerMenu({
    id: "test/test",
    command: "test"
  })
  const ret = menus.menus["test/test"];

  assertEquals(ret.command, "test");
});