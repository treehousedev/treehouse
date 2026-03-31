---
layout: layouts/docs.tsx
title: Building from Source
---
## Building from Source

You can build from source by cloning or forking the project and installing [Deno](https://deno.land/). Then you can run:

`deno task build`

This will build the project site into `web/_out` and generate the demo/library bundle at `web/static/lib/treehouse.min.js`, which is copied into the final site output as `/lib/treehouse.min.js`.

If you only need the embeddable library bundle, you can run:

`deno task bundle`

For development or debugging, you can run:

`deno task serve`

This will build and serve this website locally, including the live demo site at `localhost:9000/demo`, which will use
and watch for changes in the `lib` source.
