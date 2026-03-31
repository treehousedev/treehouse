import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";
import { GitHubBackend } from "./github.ts";

Deno.test("github backend export smoke test", () => {
  assertEquals(typeof GitHubBackend, "function");
});
