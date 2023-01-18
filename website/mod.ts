import { walkSync } from "https://deno.land/std/fs/mod.ts";
import { extname, normalize } from "https://deno.land/std/path/mod.ts";

import {m,render,pretty,showdown,matter} from "./deps.ts";
import globals from "./globals.ts";

export const rootdir = new URL('.', import.meta.url).pathname;
export const pagedir = `${rootdir}pages`;
export const layoutdir = `${rootdir}layouts`;

export function exists(pathname: string): boolean {
  try {
    Deno.statSync(pathname);
    return true;
  } catch(e) {
    if (e instanceof Deno.errors.NotFound)
      return false;
    throw e;
  }
}

function resolve(pathname: string): string|null {
  if (exists(`${pathname}.tsx`)) return `${pathname}.tsx`;
  if (exists(`${pathname}.md`)) return `${pathname}.md`;
  if (exists(`${pathname}/index.tsx`)) return `${pathname}/index.tsx`;
  if (exists(`${pathname}/index.md`)) return `${pathname}/index.md`;
  return null;
}

async function loadLayout(path: string): any {
  return (await import(resolve(`${layoutdir}/${path}`))).default;
}

export async function generate(path: string): string|null {
  const pagepath = resolve(`${pagedir}/${path}`);
  if (!pagepath) return null;
  const attrs = Object.assign({}, globals);
  switch (extname(pagepath)) {
  case ".md":
    const page = matter(await Deno.readTextFile(normalize(pagepath)));
    const converter = new showdown.Converter();
    const layout = await loadLayout(page.data.layout||"default");
    for (const key in page.data) {
      attrs[key] = page.data[key];
    }
    return pretty(render.sync(m(layout, {page: attrs}, 
                                m.trust(converter.makeHtml(page.content)))));
  case ".tsx":
    const mod = await import(normalize(pagepath));
    return pretty(render.sync(m(mod.default, {page: attrs})));
  default:
    return null;
  }
}

export function index(path: string): any[] {
  const indexdir = normalize(`${pagedir}/${path}`);
  const pages = [];
  for (const e of walkSync(indexdir, {
    includeDirs: false, 
    maxDepth: 1,
    exts: ['.md'],
  })) {
    const page = matter(Deno.readTextFileSync(e.path));
    page.path = e.path.replace(pagedir, "").replace(extname(e.path), "");
    pages.push(page);
  }
  return pages.sort(byDate);
}

export function groupByYear(idx) {
  return Object.entries(groupBy(idx, ({data}) => data.date.substring(0, 4))).reverse();
}

export function byDate(a, b) {
  const nameA = a.data.date.toUpperCase(); // ignore upper and lowercase
  const nameB = b.data.date.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
}

type MapFunc<T> = (val: T, index?: number, arr?: T[]) => T;

const groupBy = <T>(arr: T[], fn: MapFunc<T> | string) =>
  arr.map(fn).reduce((acc, val, i) => {
    acc[val] = (acc[val] || []).concat(arr[i]);
    return acc;
  }, {});