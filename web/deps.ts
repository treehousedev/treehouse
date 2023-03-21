// @deno-types="npm:@types/mithril@^2.0.3"
import {default as m} from "npm:mithril@^2.0.3";
export { m };
export {default as render} from "npm:mithril-node-render";
export {default as pretty} from "npm:pretty";

export { Marked } from "https://deno.land/x/markdown@v2.0.0/mod.ts";
export { highlightText } from 'https://deno.land/x/speed_highlight_js@1.1.11/src/index.js';

// syntactic sugar helper for jsx pages
export function page(attrs, view) {
  const merge = (a, b) => Object.assign({}, a, b);
  const page = {view: (vnode) => view(merge(vnode, {attrs: merge(vnode.attrs, attrs)}))};
  if (attrs.layout) {
    return {view: (vnode) => m(attrs.layout, merge(vnode.attrs, attrs), m(page))};
  }
  return page;  
}