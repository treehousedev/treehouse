
export interface Binding {
  command: string;
  key: string;
  //when
  //args
}

export class KeyBindings {
  bindings: Binding[];

  constructor() {
    this.bindings = [];
  }

  registerBinding(binding: Binding) {
    this.bindings.push(binding);
  }

  getBinding(commandId: string): Binding|null {
    for (const b of this.bindings) {
      if (b.command === commandId) {
        return b;
      }
    }
    return null;
  }

  evaluateEvent(event: KeyboardEvent): Binding|null {
    bindings: for (const b of this.bindings) {
      let modifiers: string[] = b.key.toLowerCase().split("+");
      let key: string = modifiers.pop();
      if (key !== event.key.toLowerCase()) {
        continue;
      }
      for (const mod of ["shift", "ctrl", "meta", "alt"]) {
        // @ts-ignore
        const modState = event[`${mod}Key`];
        if (!modState && modifiers.includes(mod)) {
          continue bindings;
        }
        if (modState && !modifiers.includes(mod)) {
          continue bindings;
        }
      }
      return b;
    }
    return null;
  }
}