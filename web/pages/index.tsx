import {m,page} from "../deps.ts";
import layout from "../layouts/default.tsx";
export default page({title: "Index", layout}, () => (
  <main>
    <h1>Treehouse</h1>
    <ul>
      <li><a href="https://github.com/treehousedev/treehouse">GitHub</a></li>
      <li><a href="/docs">Documentation</a></li>
      <li><a href="https://deno.land/x/treehouse">API</a></li>
      <li><a href="/demo">Demo</a></li>
    </ul>
  </main>
));
