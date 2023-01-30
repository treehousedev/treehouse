import {m} from "../deps.ts";

export default {view: ({attrs, children}) => {
  return (

<html>
  <head>
    <meta charset="UTF-8" />
    <link href="/style.css" rel="stylesheet"></link>
    <link rel="icon" href="/icon.png" type="image/x-icon" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/speed-highlight/core/dist/themes/default.css"></link>
    <title>{attrs.page.title?`${attrs.page.title} - ${attrs.page.site}`:attrs.page.site}</title>
  </head>
  <body>
  
  {children}

  {(attrs.page.dev)?<script src="https://deno.land/x/refresh/client.js"></script>:null}
  </body>
</html>

  )
}}
