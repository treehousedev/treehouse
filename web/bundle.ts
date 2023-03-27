
import * as esbuild from "https://deno.land/x/esbuild@v0.17.2/mod.js";

var outfile = "web/static/lib/treehouse.min.js";

console.log(`Creating bundle at ${outfile} ...`);
await esbuild.build({
  entryPoints: ["lib/mod.ts"],
  bundle: true,
  outfile: outfile,
  jsxFactory: "m",
  format: "esm",
  minify: true
});
esbuild.stop();
console.log("Finished!");
