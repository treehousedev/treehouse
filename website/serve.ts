import { serve } from "https://deno.land/std/http/server.ts";
import { refresh } from "https://deno.land/x/refresh/mod.ts";
import { serveDir } from "https://deno.land/std/http/file_server.ts";
import { generate, rootdir, exists } from "./mod.ts";
import site from "./globals.ts";

site.dev = true;

const port = 9000;
const middleware = refresh();

await serve(async (req) => {
  const res = middleware(req);
  if (res) return res;

  const pathname = new URL(req.url).pathname;

  if (pathname !== "/" && exists(`${rootdir}/public${pathname}`)) {
    return serveDir(req, {
      fsRoot: `${rootdir}/public`,
      urlRoot: ""
    });
  }

  const out = await generate(pathname);
  if (out) {
    return new Response(out, {
      status: 200,
      headers: {
        "content-type": "text/html",
        "cache-control": "no-cache, no-store, must-revalidate",
        "pragma": "no-cache",
        "expires": "0"
      },
    });  
  }

  return new Response("Not found", {
    status: 404,
    headers: {
      "content-type": "text/html",
    },
  });
}, { port });