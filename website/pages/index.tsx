import {m} from "../deps.ts";
import layout from "../layouts/default.tsx";

const Page: m.Component = {
  view ({attrs}) {
    attrs.page.title = "Index"
    return m(layout, attrs,
      <main>
        <h1>Treehouse</h1>
        <ul>
          <li><a href="/docs">Documentation</a></li>
          <li><a href="/demo">Demo</a></li>
        </ul>
      </main>
    );
  }
};

export default Page;