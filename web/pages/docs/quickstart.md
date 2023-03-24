---
layout: docs
---
# Quickstart

## Using from CDN

First, you have to directly include Mithril and MiniSearch for now:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mithril/2.0.3/mithril.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/minisearch@6.0.1/dist/umd/index.min.js"></script>
```

If you want to use our CSS, you'll also need to include the Google Font it uses:

```html
<link href="https://treehouse.sh/app/main.css" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,600;0,700;0,400&display=swap" rel="stylesheet" />
```

Then you just need some JavaScript to import and call setup with a built-in or custom backend adapter:

```html
<script type="module">
  import {setup, BrowserBackend} from "https://treehouse.sh/lib/treehouse.min.js";
  setup(document, document.body, new BrowserBackend());
</script>
```

## Building from Source

You can build from source by cloning or forking the project and installing [Deno](https://deno.land/). Then you can run:

`deno task bundle`

This will produce a JS file you can use at `web/static/lib/treehouse.min.js`. 

For development or debugging, you can run:

`deno task serve`

This will build and serve this website locally, including the live demo site at `localhost:9000/demo`, which will use
and watch for changes in the `lib` source. 

## Customizing the Frontend

The easiest aspect to customize is the look and feel, which you can do with custom CSS. Our CSS design system is built with
custom properties, so you can include your own CSS and just override them with basic CSS.

Further customization might require you to fork and change the source. The source code is very straight forward, but learn
more in the Developer Guide.

Lastly, of course, you can implement a custom backend adapter. Although there are just a few things to change this way,
more extension points will be exposed in the future so you won't have to change source. Let us know in the forum what kind
of extension points you'd like!