
export interface Binding {
  command: string;
  key: string;
  //when
  //args
}

export class KeyBindings {
  bindings: {[index: string]: Binding};

  constructor() {
    this.bindings = {};
  }

  registerBinding(binding: Binding) {
    this.bindings[binding.command] = binding;
  }

  evaluateEvent(event: Event): Binding|null {
    for (const b of Object.values(this.bindings)) {
      // TODO: more robust than this
      let [special, key] = b.key.split("+");
      if (event[`${special}Key`] && key === event.key.toLowerCase()) {
        return b;
      }
    }
    return null;
  }
}