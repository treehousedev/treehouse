
export const FirstTimeMessage = {
  view({attrs: {workspace}}) {
    return (
      <div>
        <h3 style={{margin: "0"}}>Treehouse is under active development!</h3>
        <hr />
        <p>This is a preview based on our main branch, it may have bugs. Please report them.</p>
        <p>
          Data is stored using localstorage, which you can reset with Reset Demo in the 
          <svg xmlns="http://www.w3.org/2000/svg" style={{display: "inline", marginLeft: "0.5rem", marginRight: "0.5rem"}} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>  
          menu in the top right.
        </p>
        <hr />
        <div style={{textAlign: "right"}}>
          <button style={{padding: "0.5rem", margin: "0.25rem", fontSize: "1.25rem",}} onclick={() => {
            localStorage.setItem("firsttime", "1");
            workspace.hideNotice()
          }}>Got it</button>
          
        </div>
      </div>
    )
  }
}

export const GitHubMessage = {
  view({attrs: {workspace, finished}}) {
    return (
      <div>
        <h3 style={{margin: "0"}}>Login with GitHub</h3>
        <hr />
        <p>The GitHub backend is experimental so use at your own risk!</p>
        <p>To store your workspace we will create a public repository called <pre style={{display: "inline"}}>&lt;username&gt;.treehouse.sh</pre> if it doesn't already exist. You can manually make this repository private via GitHub if you want.</p>
        <p>You can Logout via the 
          <svg xmlns="http://www.w3.org/2000/svg" style={{display: "inline", marginLeft: "0.5rem", marginRight: "0.5rem"}} width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
          </svg>
          menu in the top right to return to the localstorage backend.
        </p>
        <hr />
        <div style={{textAlign: "right"}}>
        <button style={{padding: "0.5rem", margin: "0.25rem", fontSize: "1.25rem",}} onclick={() => {
            workspace.hideNotice();
            localStorage.setItem("github", "1");
            finished();
          }}>Login with GitHub</button>
          <button style={{padding: "0.5rem", margin: "0.25rem", fontSize: "1.25rem",}} onclick={() => {
            workspace.hideNotice();
          }}>Cancel</button>
          
        </div>
      </div>
    )
  }
}

export const Notice = {
  view({attrs: {workspace, message, finished}}) {
    return (
      <div style={{
        position: "absolute", 
        left: "0", 
        right: "0", 
        top: "0", 
        bottom: "0",
      }}>
        
        <div onclick={() => workspace.hideNotice()} style={{
          position: "absolute",
          background: "black",
          opacity: "50%",
          width: "100%",
          height: "100%"
        }}></div>
        
        <div style={{
          position: "relative",
          marginLeft: "auto", 
          marginRight: "auto",
          fontSize: "1.25rem",
          width: "680px",
          borderRadius: "0.5rem",
          filter: "drop-shadow(2px 2px 4px #5555)",
          marginTop: "20vh", 
          padding: "2rem",
          background: "white"
        }}>
          {m({
            "firsttime": FirstTimeMessage,
            "github": GitHubMessage
          }[message], {workspace, finished})}
        </div>
      </div>
    )
  }
}