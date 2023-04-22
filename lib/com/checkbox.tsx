import { component } from "../manifold/components.ts";
import { Node } from "../manifold/mod.ts";

@component
export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }
}