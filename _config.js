import lume from "lume/mod.ts";
import attrs from "npm:markdown-it-attrs";
import jsx from "lume/plugins/jsx_preact.ts";
import nav from "lume/plugins/nav.ts";
import feed from "lume/plugins/feed.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import lang_javascript from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/javascript.min.js";
import lang_bash from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/bash.min.js";
import toc from "https://deno.land/x/lume_markdown_plugins/toc.ts";

import * as esbuild from "https://deno.land/x/esbuild@v0.17.2/mod.js";

let lastBuild = 0;

const site = lume({
  location: new URL("https://treehouse.sh"),
  src: "./web",
  dest: "./web/_out",
  server: {
    middlewares: [
      async (request, next) => {
        const url =  new URL(request.url);
        if (url.pathname === "/lib/treehouse.min.js") {
          if (lastBuild < Date.now()-1000) {
            await esbuild.build({
              entryPoints: ["lib/mod.ts"],
              bundle: true,
              outfile: "web/_out/lib/treehouse.js",
              jsxFactory: "m",
              sourcemap: true,
              format: "esm",
              keepNames: true,
              // minify: true
            });
            lastBuild = Date.now();
          }
          Object.defineProperty(request, "url", {value: request.url.replace(".min", "")});
        }
        return await next(request);
      }
    ]
  }
}, {
  markdown: {
    plugins: [attrs],
    keepDefaultPlugins: true,
  }
});
site.copy("static", ".");

site.use(feed({
  output: ["/blog/feed.rss", "/blog/feed.json"],
  query: "layout=layouts/blog.tsx",
  info: {
    title: "=site.title",
    description: "=site.description",
  },
  items: {
    title: "=title",
  },
})); 
site.use(toc({ 
  level: 2,
  anchor: false
}));
site.use(nav());
site.use(jsx());
site.use(codeHighlight({
  languages: {
    javascript: lang_javascript,
    bash: lang_bash,
  },
}));

site.filter("formatDate", (value) => new Date(value).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"}));

site.data("site", {
  title: "Treehouse",
  description: "An open source note-taking frontend to extend and customize."
});
site.data("backend", JSON.stringify({
  name: Deno.env.get("BACKEND") || "browser",
  url: Deno.env.get("BACKEND_URL")
}));

export default site;
