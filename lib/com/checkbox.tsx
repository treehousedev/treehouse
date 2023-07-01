import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }

  beforeEditor() {
    return CheckboxEditor;
  }
}

const CheckboxEditor = {
  view({attrs: {node}}) {
    const toggleCheckbox = (e) => {
      const checkbox = node.getComponent(Checkbox);
      checkbox.checked = !checkbox.checked;
      node.changed();
    }
    return <input type="checkbox" style={{marginTop: "0.3rem"}} onclick={toggleCheckbox} checked={node.getComponent(Checkbox).checked} />
  }
}