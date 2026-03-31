type Modifier = "shift" | "ctrl" | "alt" | "meta";

const isMac = (globalThis.navigator?.userAgent ?? "").toLowerCase().includes("mac");
const modifierKeys: Modifier[] = ["shift", "ctrl", "alt", "meta"];

export function bindingSymbols(key?: string): string[] {
  if (!key) return [];
  const symbols = {
    "backspace": "⌫",
    "shift": "⇧",
    "meta": "⌘",
    "tab": "↹",
    "ctrl": "⌃",
    "arrowup": "↑",
    "arrowdown": "↓",
    "arrowleft": "←",
    "arrowright": "→",
    "enter": "⏎"
  } as const;
  const keys = key.toLowerCase().split("+");
  return keys
    .map(filterKeyForNonMacMeta)
    .map(k => (k in symbols) ? symbols[k as keyof typeof symbols] : k);
}

// if key is meta and not on a mac, change it to ctrl,
// otherwise return the key as is
function filterKeyForNonMacMeta(key: Modifier): Modifier;
function filterKeyForNonMacMeta(key: string): string;
function filterKeyForNonMacMeta(key: string): string {
  return (!isMac && key === "meta") ? "ctrl": key;
}

function modifierState(event: KeyboardEvent, modifier: Modifier): boolean {
  switch (filterKeyForNonMacMeta(modifier)) {
    case "shift":
      return event.shiftKey;
    case "ctrl":
      return event.ctrlKey;
    case "alt":
      return event.altKey;
    case "meta":
      return event.metaKey;
  }
}

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
      const modifiers = b.key.toLowerCase().split("+");
      const key = modifiers.pop();
      if (key !== event.key.toLowerCase()) {
        continue;
      }
      for (const checkMod of modifierKeys) {
        let hasMod = modifiers.includes(checkMod);
        if (!isMac) {
          if (checkMod === "meta") continue;
          if (checkMod === "ctrl") {
            hasMod = modifiers.includes("meta") || modifiers.includes("ctrl");
          }
        }
        const modState = modifierState(event, checkMod);
        if (!modState && hasMod) {
          continue bindings;
        }
        if (modState && !hasMod) {
          continue bindings;
        }
      }
      return b;
    }
    return null;
  }
}
