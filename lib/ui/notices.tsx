
export const LockStolenMessage = {
  view() {
    return (
      <form class="notice" method="dialog">
        <h3>Refresh to view latest updates</h3>
        <p>
          Your notes were updated in another browser session. Refresh the page to view the latest version.
        </p>
        <div class="button-bar">
          <button class="primary" onclick={() => {
            location.reload()
          }}>Refresh Now</button>
          
        </div>
      </form>
    )
  }
}

export const FirstTimeMessage = {
  view({attrs: {workbench}}) {
    return (
      <form class="notice" method="dialog">
        <h3>Treehouse is under active development</h3>
        <p>This is a preview based on our main branch, which is actively being developed.</p>
        <p>If you find a bug, please report it via 
          [ <svg xmlns="http://www.w3.org/2000/svg" style={{display: "inline", marginLeft: "0.25rem", marginRight: "0.25rem"}} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg> &gt; Submit Issue ].
        </p>
        <p>
          Data is stored using localstorage, which you can reset via 
          [ <svg xmlns="http://www.w3.org/2000/svg" style={{display: "inline", marginLeft: "0.25rem", marginRight: "0.25rem"}} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg> &gt; Reset Demo ].
        </p>
        <div class="button-bar">
          <button class="primary" onclick={() => {
            localStorage.setItem("firsttime", "1");
            workbench.closeDialog();
          }}>Got it</button>
          
        </div>
      </form>
    )
  }
}

export const GitHubMessage = {
  view({attrs: {workbench, finished}}) {
    return (
      <form class="notice" method="dialog">
        <h3>Login with GitHub</h3>
        <p>The GitHub backend is experimental so use at your own risk!</p>
        <p>To store your workbench we will create a public repository called <pre style={{display: "inline"}}>&lt;username&gt;.treehouse.sh</pre> if it doesn't already exist. You can manually make this repository private via GitHub if you want.</p>
        <p>You can Logout via the 
          <svg xmlns="http://www.w3.org/2000/svg" style={{display: "inline", marginLeft: "0.5rem", marginRight: "0.5rem"}} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
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
      </form>
    )
  }
}
