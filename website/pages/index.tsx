import {m} from "../deps.ts";
import layout from "../layouts/default.tsx";

const Page: m.Component = {
  view ({attrs}) {
    attrs.page.title = "Index"
    return m(layout, attrs,
      <main>
        <div>Hello world</div>
        <div><a href="/docs">Documentation</a></div>
      </main>
    );
  }
};

export default Page;