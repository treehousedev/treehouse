import { component } from "../manifold/components.ts";
import { Node } from "../manifold/mod.ts";

@component
export class Page {
  markdown: string;

  constructor() {
    this.markdown = "";
  }
}
