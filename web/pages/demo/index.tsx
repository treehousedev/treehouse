import {m,page} from "../../deps.ts";
export default page({}, ({attrs: {dev, backend}}) => (
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
    <meta name="window" content="resizable=true,center=true,width=1024,height=768" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="/app/main.css" rel="stylesheet"></link>
    <link rel="icon" href="/icon.png" type="image/x-icon" />
    <link rel="manifest" href="/app/main.webmanifest" />
    <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400&display=swap" rel="stylesheet" type="text/css"></link>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mithril/2.0.3/mithril.min.js" integrity="sha512-NJfYo9jBx+EzVI27l/hbSs/6EEkmlG5YAEx0e7WxqBG6yNOwasjYr+xeoTFCfpczQ/dSgAKZAKy5YMTml99srg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/minisearch@6.0.1/dist/umd/index.min.js"></script>
    <title>Treehouse</title>
  </head>
  <body>
    <div style={{textAlign: "center", marginTop: "40vh"}}>
      <div class="lds-ripple"><div></div><div></div></div>
    </div>
    <script>
      window.backend = {JSON.stringify(backend)};
    </script>
    <script src="/app/main.js" type="module"></script>
    {(dev)?<script src="https://deno.land/x/refresh/client.js"></script>:null}
  </body>
</html>
));
