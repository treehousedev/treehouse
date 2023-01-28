import { walk } from "https://deno.land/std/fs/mod.ts";
import { extname, dirname } from "https://deno.land/std/path/mod.ts";
import { copy } from "https://deno.land/std/fs/copy.ts";

import {generate, rootdir, pagedir} from "./mod.ts";

function mkdirAll(path: string) {
  try {
    Deno.mkdirSync(path, { recursive: true });
  } catch {}
}

const outpath = "./web/out";

mkdirAll(dirname(outpath));
copy(`${rootdir}/static`, `${outpath}`, {overwrite: true});

for await(const e of walk(pagedir, {
  includeDirs: false,
  exts: ['.md', '.tsx'],
})) {
  if (e.isFile) {
    const pathname = e.path
      .replace(`${Deno.cwd()}/web/pages`, "")
      .replace(extname(e.path), "");
    const out = await generate(pathname);
    if (out) {
      const target = `${outpath}${pathname}${pathname.endsWith("index")?"":"index"}.html`;
      mkdirAll(dirname(target));
      await Deno.writeTextFile(target, out);
      console.log(target);
    }
  }
}
