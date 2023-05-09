
export const Search: m.Component = {
  onupdate({ state, dom }) {
    const results = dom.querySelector(".results");
    if (results && state.selected !== undefined && results.children.length > 0) {
      results.children[state.selected].scrollIntoView({ block: "nearest" });
    }
  },

  view({ attrs: { workbench }, state }) {
    
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
      const mod = (a, b) => ((a % b) + b) % b;
      if (e.key === "ArrowDown") {
        if (state.selected === undefined) {
          state.selected = 0;
          return;
        }
        state.selected = mod(state.selected + 1, state.results.length);
        return false;
      }
      if (e.key === "ArrowUp") {
        if (state.selected === undefined) {
          state.selected = 0;
        }
        state.selected = mod(state.selected - 1, state.results.length);
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
        let splitQuery = state.query.split(/[ ]+/);
        let textQuery = splitQuery.filter(term => !term.includes(":")).join(" ");
        let fieldQuery = Object.fromEntries(splitQuery.filter(term => term.includes(":")).map(term => term.toLowerCase().split(":")));
        if (!textQuery && Object.keys(fieldQuery).length > 0) {
          // when text query is empty, no results will show up,
          // but we index field names, so this works for now.
          textQuery = Object.keys(fieldQuery)[0];
        }
        state.results = workbench.backend.index.search(textQuery).map(id => {
          let node = workbench.workspace.find(id);
          if (!node) {
            return undefined;
          }
          // if component value, get the parent
          if (node.value) {
            node = node.parent;
            // parent might not actually exist
            if (!node.raw) return undefined;
          }
          // kludgy filter on fields
          if (Object.keys(fieldQuery).length > 0) {
            const fields = {};
            for (const f of node.getLinked("Fields")) {
              fields[f.name.toLowerCase()] = f.value.toLowerCase();
            }
            for (const f in fieldQuery) {
              if (!fields[f] || fields[f] !== fieldQuery[f]) {
                return undefined;
              }
            }
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
      <div class={(state.results.length > 0) ? "search active flex grow" : "search flex grow"}>
        <div>
          <div class="flex" style={{ margin: (state.results.length > 0) ? "0" : "1px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search" value={state.query} onkeydown={onkeydown} oninput={autocomplete} style={{
              border: "0", 
              outline: "0", 
              background: "transparent", 
              paddingTop: "3px"
            }} />
          </div>
          {(state.results.length > 0) ?
            <div class="results" style={{
              overflowX: "hidden",
              overflowY: "auto",
              maxHeight: "400px"
            }}>
              {state.results.map((result, idx) => <div onclick={() => open(result)} class={(state.selected === idx) ? "selected" : ""}>{result.name}</div>)}
            </div>
            : null}
        </div>
      </div>
    )
  }
}
