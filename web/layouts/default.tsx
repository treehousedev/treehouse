import {m} from "../deps.ts";
export default {view: ({attrs, children}) => (
  <html>
    <head>
      <!-- Google tag (gtag.js) -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-SGR1T7X7KS"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-SGR1T7X7KS');
      </script>
      <meta charset="UTF-8" />
      <link href="/style.css" rel="stylesheet"></link>
      <link rel="icon" href="/icon.png" type="image/x-icon" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/speed-highlight/core/dist/themes/default.css"></link>
      <title>{attrs.title?`${attrs.title} - ${attrs.site}`:attrs.site}</title>
    </head>
    <body>
    {children}
    {(attrs.dev)?<script src="https://deno.land/x/refresh/client.js"></script>:null}
    </body>
  </html>
)};
