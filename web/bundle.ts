
import * as esbuild from "https://deno.land/x/esbuild@v0.17.2/mod.js";

console.log("Creating bundle...");
await esbuild.build({
  entryPoints: ["lib/mod.ts"],
  bundle: true,
  outfile: "web/static/lib/treehouse.min.js",
  jsxFactory: "m",
  format: "esm",
  minify: true
});
esbuild.stop();
console.log("Finished!");
