---
layout: layouts/docs.tsx
title: Using from CDN
---
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
