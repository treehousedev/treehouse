import {m} from "../deps.ts";
import layout from "./default.tsx";
export default {view: ({attrs, children}) => m(layout, Object.assign({title: "Docs"}, attrs),
<section>
  <div class="row justify-center items-start" style="gap: var(--16);">
    <nav class="md:hidden" style="flex: none; min-width: 256px;">
      <h5><a href="/docs">Welcome</a></h5>
      <h5><a href="/docs/quickstart">Quickstart</a></h5>
      <ul>
        <li><a href="/docs/quickstart">Using from CDN</a></li>
        <li><a href="/docs/quickstart">Building from Source</a></li>
        <li><a href="/docs/quickstart">Customizing the Frontend</a></li>
      </ul>
      <h5><a href="/docs/user">User Guide</a></h5>
      <ul>
        <li><a href="/docs/user">Using the Interface</a></li>
        <li><a href="/docs/user">Workspace Model</a></li>
        <li><a href="/docs/user">Backend Extensions</a></li>
      </ul>
      <h5><a href="/docs/dev">Developer Guide</a></h5>
      <ul>
        <li><a href="/docs/dev">Overview</a></li>
        <li><a href="/docs/dev">Data Model</a></li>
        <li><a href="/docs/dev">User Actions</a></li>
        <li><a href="/docs/dev">Workbench UI</a></li>
        <li><a href="/docs/dev">Backend Adapters</a></li>
        <li><a href="/docs/dev">API Reference</a></li>
      </ul>
      <h5><a href="/docs/project">Project Guide</a></h5>
      <ul>
        <li><a href="/docs/project">Contributing</a></li>
        <li><a href="/docs/project">Roadmap</a></li>
      </ul>
    </nav>
    <article class="grow">
      {children}
    </article>
  </div>
</section>
)}