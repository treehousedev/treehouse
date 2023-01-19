import {m} from "../../deps.ts";
import layout from "../../layouts/default.tsx";

const Page: m.Component = {
  view ({attrs}) {
    return m(layout, attrs,

<html>
  <head>
    <meta charset="UTF-8" />
    <link href="/style.css" rel="stylesheet"></link>
    <link rel="icon" href="/icon.png" type="image/x-icon" />
    <link rel="manifest" href="/demo/app.webmanifest" />
    <title>Demo</title>
  </head>
  <body>
  
  <main>
    <h2>Demo</h2>
    <div>Nothing to see here.</div>
  </main>

  {(attrs.page.dev)?<script src="https://deno.land/x/refresh/client.js"></script>:null}
  </body>
</html>
      
    );
  }
};

export default Page;