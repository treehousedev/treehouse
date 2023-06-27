
export interface Attrs {
  input: string;
  inputview: (onkeydown: Function, oninput: Function) => any;
  itemview: (item: any, idx: number) => any;
  onpick: (item: any) => void;
  onchange: (State) => void;
}

export interface State {
  selected: number;
  input: string;
  items: any[];
}

export const Picker: m.Component<Attrs, State> = {
  onupdate({ state, dom }) {
    const items = dom.querySelector(".items").children;
    if (state.selected !== undefined && items.length > 0) {
      items[state.selected].scrollIntoView({ block: "nearest" });
    }
  },

  oncreate({ state, dom }) {
    dom.querySelector("input").focus();
    if (state.selected === undefined) {
      state.selected = 0;
    }
  },

  view({ attrs, state }) {
    
    state.selected = (state.selected === undefined) ? 0 : state.selected;
    state.input = (state.input === undefined) ? (attrs.input || "") : state.input;
    if (state.items === undefined) {
      state.items = [];
      attrs.onchange(state);
    }

    const onkeydown = (e) => {
      const mod = (a, b) => ((a % b) + b) % b;
      if (e.key === "ArrowDown") {
        if (state.selected === undefined) {
          state.selected = 0;
          return;
        }
        state.selected = mod(state.selected + 1, state.items.length);
        return false;
      }
      if (e.key === "ArrowUp") {
        if (state.selected === undefined) {
          state.selected = 0;
        }
        state.selected = mod(state.selected - 1, state.items.length);
        return false;
      }
      if (e.key === "Enter") {
        if (state.selected !== undefined) {
          attrs.onpick(state.items[state.selected]);
        }
        return false;
      }
    }
    const oninput = (e) => {
      state.input = e.target.value;
      state.selected = 0;
      attrs.onchange(state);
    }
    return (
      <div class="picker">
        {attrs.inputview(onkeydown, oninput, state.input)}
        <div class="items">
          {state.items.map((item, idx) => (
            <div class={(state.selected === idx) ? "item selected" : "item"} 
              onclick={() => attrs.onpick(item)}
              onmouseover={() => state.selected = idx}>
              {attrs.itemview(item, idx)}
            </div>
          ))}
        </div>
      </div>
    )
  }
}
