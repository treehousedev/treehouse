import {m,page} from "../../deps.ts";
export default page({}, ({attrs: {dev}}) => (
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="/demo/style.css" rel="stylesheet"></link>
    <link rel="icon" href="/icon.png" type="image/x-icon" />
    <link rel="manifest" href="/demo/app.webmanifest" />
    <link href="https://fonts.googleapis.com/css?family=Work Sans" rel="stylesheet" type="text/css"></link>
    <link href="https://fonts.googleapis.com/css2?family=Recursive:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"></link>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mithril/2.0.3/mithril.min.js" integrity="sha512-NJfYo9jBx+EzVI27l/hbSs/6EEkmlG5YAEx0e7WxqBG6yNOwasjYr+xeoTFCfpczQ/dSgAKZAKy5YMTml99srg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <title>Demo</title>
  </head>
  <body>
    <script src="/demo/demo.js" type="module"></script>
    {(dev)?<script src="https://deno.land/x/refresh/client.js"></script>:null}
  </body>
</html>
));
