import { Picker } from "./picker.tsx";

export const Search: m.Component = {

  view({ attrs: { input, workbench } }) {
    
    const onpick = (node) => {
      workbench.closeDialog();
      workbench.open(node);
    }
    const onchange = (state) => {
      if (state.input) {
        state.items = workbench.search(state.input);
      } else {
        state.items = [];
      }      
    }

    return (
      <div class="search">
        <Picker onpick={onpick} onchange={onchange} input={input}
          inputview={(onkeydown, oninput, value) => 
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search shrink-0 items-center"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search" value={value} onkeydown={onkeydown} oninput={oninput} />
            </div>
          }
          itemview={(result) => <div>{result.name}</div>} />
      </div>
    )
  }
}
