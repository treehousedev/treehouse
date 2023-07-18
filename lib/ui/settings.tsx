
export const Settings = {
  view({attrs: {workbench}, state}) {
    const currentTheme = workbench.workspace.settings.theme;
    state.selectedTheme = (state.selectedTheme === undefined) ? currentTheme : state.selectedTheme;
    const oninput = (e) => {
      state.selectedTheme = e.target.value;
    }
    return (
      <div class="notice">
        <h3>Settings</h3>
        <div class="flex flex-row">
          <div class="grow">Theme</div>
          <div>
            <select name="theme" oninput={oninput}>
              <option selected={state.selectedTheme===""} value="">Light</option>
              <option selected={state.selectedTheme==="darkmode"} value="darkmode">Dark</option>
              <option selected={state.selectedTheme==="sepia"} value="sepia">Sepia</option>
              <option selected={state.selectedTheme==="sublime"} value="sublime">Sublime</option>
            </select>
          </div>
        </div>
        <div class="button-bar">
          <button onclick={() => {
            workbench.closeDialog();
          }}>Cancel</button>
          <button class="primary" onclick={async (e) => {
            if (currentTheme !== state.selectedTheme) {
              workbench.workspace.settings.theme = state.selectedTheme;
              await workbench.workspace.save(true);
              location.reload();
            }  else {
              workbench.closeDialog();
            }
          }}>Save Changes</button>
        </div>
      </div>
    )
  }
}