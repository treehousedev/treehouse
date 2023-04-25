import { component } from "../model/components.ts";
import { Node } from "../model/mod.ts";

@component
export class Checkbox {
  checked: boolean;

  constructor() {
    this.checked = false;
  }

  editor() {
    return CheckboxEditor;
  }
}

const CheckboxEditor = {
  view({attrs}) {
    const {node, panel, workbench} = attrs;
    const toggleCheckbox = (e) => {
      const checkbox = node.getComponent(Checkbox);
      checkbox.checked = !checkbox.checked;
      node.changed();
    }
    return <input type="checkbox" style={{marginTop: "0.3rem", marginRight: "0.5rem"}} onclick={toggleCheckbox} checked={node.getComponent(Checkbox).checked} />
  }
}