import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }
}