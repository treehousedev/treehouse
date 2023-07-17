import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

// deprecated

@component
export class Page {
  markdown: string;

  constructor() {
    this.markdown = "";
  }
}
