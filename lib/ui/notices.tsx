
export const LockStolenMessage = {
  view() {
    return (
      <div class="notice">
        <h3>Refresh to view latest updates</h3>
        <p>
          Your notes were updated in another browser session. Refresh the page to view the latest version.
        </p>
        <div class="button-bar">
          <button class="primary" onclick={() => {
            location.reload()
          }}>Refresh Now</button>
          
        </div>
      </div>
    )
  }
}

export const FirstTimeMessage = {
  view({attrs: {workbench}}) {
    return (
      <div class="notice">
        <h3>Treehouse is under active development</h3>
        <p>This is a preview based on our main branch, which is actively being developed.</p>
        <p>If you find a bug, please report it via 
          &nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          &nbsp;&gt; <strong>Submit Issue</strong>.
        </p>
        <p>
          Data is stored using localstorage, which you can reset via 
          &nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          &nbsp;&gt; <strong>Reset Demo</strong>.
        </p>
        <div class="button-bar">
          <button class="primary" onclick={() => {
            localStorage.setItem("firsttime", "1");
            workbench.closeDialog();
          }}>Got it</button>
          
        </div>
      </div>
    )
  }
}

export const GitHubMessage = {
  view({attrs: {workbench, finished}}) {
    return (
      <div class="notice">
        <h3>Login with GitHub</h3>
        <p>The GitHub backend is experimental so use at your own risk!</p>
        <p>To store your workbench we will create a public repository called <pre style={{display: "inline"}}>&lt;username&gt;.treehouse.sh</pre> if it doesn't already exist. You can manually make this repository private via GitHub if you want.</p>
        <p>You can Logout via the 
          &nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          &nbsp;
          menu in the top right to return to the localstorage backend.
        </p>
        <div class="button-bar">
          <button onclick={() => {
            workbench.closeDialog();
          }}>Cancel</button>
          <button class="primary" onclick={() => {
              workbench.closeDialog();
              localStorage.setItem("github", "1");
              finished();
            }}>Log in with GitHub</button>
        </div>
      </div>
    )
  }
}
