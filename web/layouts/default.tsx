import {m} from "../deps.ts";
export default {view: ({attrs, children}) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <link href="/style.css" rel="stylesheet"></link>
      <link rel="icon" href="/icon.png" type="image/x-icon" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/speed-highlight/core/dist/themes/default.css"></link>
      <script src="/analytics.js"></script>
      <title>{attrs.title?`${attrs.title} - ${attrs.site}`:attrs.site}</title>
    </head>
    <body>
    {children}
    {(attrs.dev)?<script src="https://deno.land/x/refresh/client.js"></script>:null}
    </body>
  </html>
)};
