import {m} from "../deps.ts";
import layout from "./default.tsx";
export default {view: ({attrs, children}) => m(layout, Object.assign({
  active: "docs",
  title: "Docs", 
  heading: "Documentation"
}, attrs),
<section>
  <div class="row justify-center items-start" style="gap: var(--16);">
    <nav class="md:hidden" style="flex: none; min-width: 256px; position: sticky; top: 0px;">
      <h5><a href="/docs/quickstart">Quickstart</a></h5>
      <ul>
        <li><a href="/docs/quickstart#using-from-cdn">Using from CDN</a></li>
        <li><a href="/docs/quickstart#building-from-source">Building from Source</a></li>
        <li><a href="/docs/quickstart#customizing-the-frontend">Customizing the Frontend</a></li>
      </ul>
      <h5><a href="/docs/user">User Guide</a></h5>
      <ul>
        <li><a href="/docs/user#what-is-treehouse-">What is Treehouse?</a></li>
        <li><a href="/docs/user#data-storage">Data Storage</a></li>
        <li><a href="/docs/user#nodes">Nodes</a></li>
        <li><a href="/docs/user#calendar">Calendar</a></li>
        <li><a href="/docs/user#command-palette">Command Palette</a></li>
        <li><a href="/docs/user#keyboard-shortcuts">Keyboard Shortcuts</a></li>
        <li><a href="/docs/user#backend-extensions">Backend Extensions</a></li>
      </ul>
      <h5><a href="/docs/dev">Developer Guide</a></h5>
      <ul>
        <li><a href="/docs/dev#overview">Overview</a></li>
        <li><a href="/docs/dev#data-model">Data Model</a></li>
        <li><a href="/docs/dev#user-actions">User Actions</a></li>
        <li><a href="/docs/dev#workbench-ui">Workbench UI</a></li>
        <li><a href="/docs/dev#backend-adapters">Backend Adapters</a></li>
        <li><a href="/docs/dev#api-reference">API Reference</a></li>
      </ul>
      <h5><a href="/docs/project">Project Guide</a></h5>
      <ul>
        <li><a href="/docs/project#contributing">Contributing</a></li>
        <li><a href="/docs/project#roadmap">Roadmap</a></li>
      </ul>
    </nav>
    <article class="grow">
      {children}
    </article>
  </div>
</section>
)}