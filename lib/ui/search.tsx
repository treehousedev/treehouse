
export const Search: m.Component = {
  onupdate({state,dom}) {
    const results = dom.querySelector(".results");
    if (results && state.selected !== undefined && results.children.length > 0) {
      results.children[state.selected].scrollIntoView({block: "nearest"});
    }
  },

  view({attrs: {workbench}, state}) {
    
    state.query = (state.query === undefined) ? "" : state.query;
    state.results = (state.results === undefined) ? [] : state.results;

    const clear = () => {
      state.query = "";
      state.results = [];
      workbench.curtain = null;
    }

    const open = (node) => {
      workbench.open(node);
      clear();
    }
    
    const onkeydown = (e) => {
      const mod = (a,b) => ((a % b) + b) % b;
      if (e.key === "ArrowDown") {
        if (state.selected === undefined) {
          state.selected = 0;
          return;
        }
        state.selected = mod(state.selected+1, state.results.length);
        return false;
      }
      if (e.key === "ArrowUp") {
        if (state.selected === undefined) {
          state.selected = 0;
        }
        state.selected = mod(state.selected-1, state.results.length);
        return false;
      }
      if (e.key === "Enter") {
        if (state.selected !== undefined) {
          open(state.results[state.selected]);
        }
        return false;
      }
      if (e.key === "Escape") {
        clear();
      }
    }

    const autocomplete = (e) => {
      state.query = e.target.value;
      state.selected = 0;

      if (state.query) {
        state.results = workbench.backend.index.search(state.query).map(id => {
          let node = workbench.nodes.find(id);
          if (!node) {
            return undefined;
          }
          // if component value, get the parent
          if (node.getValue()) {
            node = node.getParent();
            // parent might not actually exist
            if (!node.raw) return;
          }
          return node;
        }).filter(n => n !== undefined);
      } else {
        state.results = [];
      }

      if (state.query && state.results.length > 0) {
        workbench.curtain = {
          visible: false,
          onclick: () => clear()
        };
      } else {
        workbench.curtain = null;
      }
      
    }

    return (
      <div class="search" style={{position: "relative", display: "flex", flexGrow: "1", padding: "calc(var(--padding)/2)"}}>
        <div style={{
            width: "95%",
            padding: "calc(var(--padding)/2)",
            borderRadius: "0.25rem",
            border: (state.results.length > 0)?"1px solid var(--dark)":"none",
            position: "absolute",
            zIndex: (state.results.length > 0)?"100":"1",
            background: (state.results.length > 0)?"white":null
          }}>
          <input type="text" placeholder="Search" value={state.query} onkeydown={onkeydown} oninput={autocomplete} style={{width: "99%", border: "0", outline: "0", background: "transparent", marginRight: "var(--padding)"}} />
          {(state.results.length > 0)?
            <div class="results" style={{
              marginTop: "0.25rem",
              overflowX: "hidden",
              overflowY: "auto",
              maxHeight: "400px"
            }}>
              {state.results.map((result, idx) => <div onclick={() => open(result)} class={(state.selected===idx)?"selected":""}>{result.getName()}</div>)}
            </div>
          :null}
        </div>
      </div>
    )
  }
}
