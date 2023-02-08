
export const Search: m.Component = {
  onupdate({state,dom}) {
    const results = dom.querySelector(".results");
    if (results && state.selected !== undefined && results.children.length > 0) {
      results.children[state.selected].scrollIntoView({block: "nearest"});
    }
  },

  view({attrs: {workspace}, state}) {
    
    state.query = (state.query === undefined) ? "" : state.query;
    
    
    let results = [];
    if (state.query) {
      results = workspace.backend.index.search(state.query).map(id => {
        let node = workspace.nodes.find(id);
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
    }

    const open = (node) => {
      workspace.open(node);
      state.query = "";
    }
    
    const onkeydown = (e) => {
      const mod = (a,b) => ((a % b) + b) % b;
      if (e.key === "ArrowDown") {
        if (state.selected === undefined) {
          state.selected = 0;
          return;
        }
        state.selected = mod(state.selected+1, results.length);
        return false;
      }
      if (e.key === "ArrowUp") {
        if (state.selected === undefined) {
          state.selected = 0;
        }
        state.selected = mod(state.selected-1, results.length);
        return false;
      }
      if (e.key === "Enter") {
        if (state.selected !== undefined) {
          open(results[state.selected]);
        }
        return false;
      }
      if (e.key === "Escape") {
        state.query = "";
      }
    }
    const autocomplete = (e) => {
      state.query = e.target.value;
      state.selected = 0;
    }
    return (
      <div class="search" style={{position: "relative", display: "flex", flexGrow: "1", padding: "calc(var(--padding)/2)"}}>
        <div style={{
            width: "95%",
            padding: "calc(var(--padding)/2)",
            borderRadius: "0.25rem",
            border: (results.length > 0)?"1px solid var(--dark)":"none",
            position: "absolute",
            background: (results.length > 0)?"white":null
          }}>
          <input type="text" placeholder="Search" value={state.query} onkeydown={onkeydown} oninput={autocomplete} style={{width: "99%", border: "0", outline: "0", background: "transparent", marginRight: "var(--padding)"}} />
          {(results.length > 0)?
            <div class="results" style={{
              marginTop: "0.25rem",
              overflowX: "hidden",
              overflowY: "auto",
              maxHeight: "400px",
            }}>
              {results.map((result, idx) => <div onclick={() => open(result)} class={(state.selected===idx)?"selected":""}>{result.getName()}</div>)}
            </div>
          :null}
        </div>
      </div>
    )
  }
}
