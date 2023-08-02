---
layout: layouts/docs.tsx
title: Overview
---
## Overview

Treehouse is a frontend written in TypeScript made to be rendered in a browser or webview for building note-taking and information management tools. It is a "thick" frontend in that it holds most application state in-memory and executes user triggered commands to mutate that state. Persistence of that state, and a few other features, are expected to be provided by a "backend", which the frontend code interacts with via a backend adapter.
Even without a backend adapter, the Treehouse frontend is still a fully functional application packaged as a JavaScript library that can be loaded onto any HTML page.

### Architecture

The library exposes a `setup()` function that:

1. Takes a DOM document and backend adapter object
1. Sets up a central controller for the UI called Workbench
1. Loads a Workspace using the backend adapter
1. Registers built-in commands and keybindings
1. Uses [Mithril.js](https://mithril.js.org/) to mount a top level Mithril component to the document

The UI is represented by a class called Workbench. This class orchestrates and provides most of the API for the rest of the system. The UI is broken down into Mithril components that implement the views for each part of the UI, pulling state from Workbench and connecting interactions to registered commands that represent all user actions. The Workbench and commands manipulate a Workspace, which represents the main data model for the system.

### Stack

To avoid the complexity and dependency hell, Treehouse avoids most common JavaScript tooling such as Node.js and NPM. Instead, Treehouse uses [Deno](https://deno.land/) as a toolchain and otherwise avoids dependencies as much as possible. The other main dependency we have is [Mithril.js](https://mithril.js.org/), which was chosen for its simplicity and lack of further dependencies.

That said, there are other dependencies beyond this core stack which are chosen very deliberately. Out of the box search indexing depends on [MiniSearch](https://lucaong.github.io/minisearch/), and our most complex (but unavoidable) dependency is [CodeMirror](https://codemirror.net/). We're very conscious of project dependencies, including development and toolchain dependencies.