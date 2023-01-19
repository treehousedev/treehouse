import {m} from "../../deps.ts";
import layout from "../../layouts/default.tsx";

const Page: m.Component = {
  view ({attrs}) {
    attrs.page.title = "Demo"
    return m(layout, attrs,
      <main>
        <h2>Demo</h2>
        <div>Nothing to see here.</div>
      </main>
    );
  }
};

export default Page;