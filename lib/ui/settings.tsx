
export const Settings = {
  view({attrs: {workbench}}) {
    const currentTheme = workbench.workspace.settings.theme;
    return (
      <form class="notice" method="dialog">
          <h3>Settings</h3>
          <div class="flex flex-row">
            <div class="grow">Theme</div>
            <div>
              <select name="theme">
                <option selected={currentTheme===""} value="">Light</option>
                <option selected={currentTheme==="darkmode"} value="darkmode">Dark</option>
                <option selected={currentTheme==="sepia"} value="sepia">Sepia</option>
                <option selected={currentTheme==="sublime"} value="sublime">Sublime</option>
              </select>
            </div>
          </div>
          <div class="button-bar">
            <button onclick={() => {
              workbench.closeDialog();
            }}>Cancel</button>
            <button class="primary" onclick={async (e) => {
              let newTheme = e.target.closest("form").elements[0].value;
              if (currentTheme !== newTheme) {
                workbench.workspace.settings.theme = newTheme;
                await workbench.workspace.save(true);
                location.reload();
              }  else {
                workbench.closeDialog();
              }
            }}>Save Changes</button>
          </div>
      </form>
    )
  }
}