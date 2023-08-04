---
layout: layouts/docs.tsx
title: Building from Source
---
## Building from Source

You can build from source by cloning or forking the project and installing [Deno](https://deno.land/). Then you can run:

`deno task bundle`

This will produce a JS file you can use at `web/static/lib/treehouse.min.js`. 

For development or debugging, you can run:

`deno task serve`

This will build and serve this website locally, including the live demo site at `localhost:9000/demo`, which will use
and watch for changes in the `lib` source.