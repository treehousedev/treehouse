---
layout: docs
---
# Developer Guide

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

## Data Model

The "document" for Treehouse is the Workspace, which is  mostly a container for nodes. These nodes are based on a versatile and extensible API and data model called Manifold. In short, nodes:

* have a unique ID
* have a text name
* can be children to other nodes
* can have key-value attributes
* can have components

Most importantly, nodes build a tree-like structure where each node can be extended with components. Components extend the state and functionality of a node. For example, a checkbox component can be added to a node. This gives it a state (checked or not) and allows the UI to render it differently (add a checkbox). 

## User Actions

All user performable actions are modeled as commands and registered with a command system. Commands are  functions with some extra metadata, like a user displayable name and system identifier. They can be called throughout the system by their system identifier, such as when a user clicks a something.

Menus are often defined upfront, usually by commands. Commands can have keybindings registered for them for keyboard shortcuts. These systems work together. For example, a menu item for a command will show the keybinding for it. 

Commands can take arguments and usually take at least a single argument called a context. This is a way to represent state of the user’s current context, such as the currently selected node. 

In addition to menus, keyboard shortcuts, and UI event handlers, there is a command palette the user can trigger to show all commands that can be run in the current context. 

## Workbench UI

### Components

The workbench UI is made up of Mithril components, which are similar to React components. They take parameters, can have state, and specify a view using JSX. Instead of many atomic components like buttons and labels, Treehouse focuses on larger functional components that map to areas of the UI. Reusable visual elements are represented by CSS classes. Only if a reusable atomic visual element becomes so re-used and is too complex to re-implement is it made into a Mithril component.

All the Mithril components can be found under `lib/ui`. We use Typescript to make sure their parameters are typed so they're picked up by API documentation; no need for custom documentation for view components. Mithril components are just plain old JavaScript objects with a `view` method. 

### User Context

Most components are explicitly passed a reference to the Workbench, which they can use to execute commands or pull data in the current Workspace or Context. The Workbench provides a top level context that has the current selected node or nodes, the current panel, etc. However, when passing a Context around it can be given overrides. For example, you may be currently editing a particular node, but you use the mouse to perform a command on another node. The menu ensures the command will receive a Context with that node being acted on. 

### Design System

Our design system is inspired by projects like [Pollen](https://www.pollen.style/), where instead of generating CSS classes from JavaScript like Tailwind (which requires a compile step and Node.js based tooling), we simply use and override CSS custom properties. This means they can be used in inline styles as well. We also have a subset of common Tailwind utility classes defined, though using the custom properties. 

## Backend Adapters

Backend adapters are classes that implement the backend API for a given backend. If you wanted to make your own custom backend, you would implement your own backend adapter
implementing the APIs you wish to hook into and pass that into the `setup` function when initializing Treehouse. We also have a handful of built-in adapters for public or
well-known backend interfaces:

### lib/backend/browser.ts

This backend implements the FileStorage API using localStorage. This means data will be stored in the browser for a particular device. It also implements search indexing
using MiniSearch. It does not implement the Authenticator API.

### lib/backend/github.ts

This backend implements the FileStorage API using the GitHub API to store data in a GitHub hosted Git repository. It also implements the Authenticator API against a 
script that can be hosted on CloudFlare Workers that implements an OAuth client for the GitHub API. This backend adapter does not implement a search index, it simply
uses the browser implementation (MiniSearch).

### lib/backend/filesystem.ts (coming soon)

This backend implements the FileStorage API using a local filesystem. Since there isn't a good standard filesystem API in browsers, this implementation operates against
a simple REST API that can be implemented by a backend host process, such as Electron, Apptron, or something custom. 

### Writing an Adapter

An adapter is just an object that implements this API:

```js
interface Backend {
  auth: Authenticator|null;
  index: SearchIndex;
  files: FileStore;
}

interface Authenticator {
  login();
  logout();
  currentUser(): User|null;
}

interface User {
  userID(): string;
  displayName(): string;
  avatarURL(): string;
}

interface SearchIndex {
  index(node: RawNode);
  remove(id: string);
  search(query: string): string[];
}

interface FileStore {
  async readFile(path: string): string|null;
  async writeFile(path: string, contents: string);
}
```

The Authenticator API is optional (and soon so might the SearchIndex API, always defaulting to MiniSearch). Typically a backend adapter will
set `auth`, `index`, and `files` to `this` and implement each of those interfaces on that same object.


## API Reference

TypeScript documentation for Treehouse is available via [Deno Land](https://deno.land/x/treehouse@0.1.0).