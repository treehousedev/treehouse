---
layout: docs
---
# Developer Guide

## Overview

Treehouse is a frontend written in TypeScript made to be rendered in a browser or webview for building note-taking and information management tools. 
It can be considered a "thick" frontend in that it holds most application state in-memory and executes user triggered commands to mutate that state. Persistance of that
state, and a few other features, are expected to be provided by a "backend", which the frontend code interacts with via a backend adapter. If you were to ignore persistence of
state and authentication and such, the Treehouse frontend is still a fully functional application packaged as a JavaScript library that can be loaded onto any HTML page.

### Architecture

The library exposes a `setup()` function that takes a DOM document and backend adapter object, then sets up a central controller for the UI called Workbench, loads
a Workspace using the backend adapter, registers a bunch of built-in commands and keybindings, then uses [Mithril.js](https://mithril.js.org/) to mount a top level Mithril
component to the document.

Workbench is what we call the UI and is represented as a class called Workbench. This class orchestates and provides most of the API for the rest of the system. The UI is broken
down into Mithril components that implement the views for each part of the UI, pulling state from Workbench and connecting interactions to registered commands that represent all user
actions. The Workbench and commands manipulate a Workspace, which represents the main data model for the system. Each of these ideas are explained in more detail below.

### Stack

Although a JavaScript library, Treehouse avoids most common JavaScript tooling such as Node.js and NPM. This is purely to avoid the complexity and dependency hell that comes
with using almost anything based on that stack. Instead, Treehouse uses [Deno](https://deno.land/) as a toolchain and otherwise avoids dependencies as much as possible. As mentioned, 
the main dependency we have other than Deno is [Mithril.js](https://mithril.js.org/), which was chosen for its simplicity and lack of further dependencies.

That said, there are other dependencies beyond this core stack. These are chosen very deliberately with as similar criteria to Mithril as possible. Out of the box 
search indexing depends on [MiniSearch](https://lucaong.github.io/minisearch/), and our most complex (but unavoidable) dependency is [CodeMirror](https://codemirror.net/).
There are others, but the main point is we're very conscious of project dependencies, including development and toolchain dependencies. 


## Data Model

The "document" for Treehouse is the Workspace. Other than some metadata like what's expanded and what you last had open, Workspace is mostly a container for nodes. These nodes
are based on a system called Manifold, which is an API and data model that is highly versatile and extensible. In short, these nodes:

* have a unique ID
* have a text name
* can be children to other nodes
* can have key-value attributes
* can have components

The key idea is the last one. Nodes build a tree-like structure where each node can be extended with components. Components extend the state and functionality of a node.
For example, a checkbox component can be added to a node. This not only gives it state for a checkbox, whether it's checked or not, but seeing this component on a node
means the UI can render it differently. In this case, it adds a checkbox at the beginning of a node's text. 

Since this is not fully utilized yet in Treehouse, we'll stop there for now. The important idea is that a Workspace is a collection of nodes organized into a tree and this
is the main data model of Treehouse.

## User Actions

All user performable actions are modeled as commands and registered with a command system. These are basically just functions with some extra metadata, like a user
displayable name and system identifier. These can be called throughout the system by their system identifier directly, such as when a user clicks a something.

Menus are also often defined upfront, usually defined by commands. Commands can also have keybindings registered for them for keyboard shortcuts. These systems
work together. For example, a menu item for a command will also show the keybinding for it. 

Commands can take arguments and typically always take at least a single argument called a context. This is described in the next section, but is a way to represent
state of the users current context, such as the currently selected node. 

Although commands are triggered by the user via menus, keyboard shortcuts, or event handlers in the UI, there is also a command palette the user can trigger to show
all commands that can be run in the current context. 

## Workbench UI

The actual UI of the workbench is made up of Mithril components, which are similar to React components. They take parameters, can have state, and specify a view using
JSX. Instead of lots of atomic components (like buttons, and labels), Treehouse focuses on larger functional components that map to areas of the UI. Reusable visual 
elements are represented by CSS classes. Only if a reusable atomic visual element becomes so re-used and is too complex to re-implement is it made into a Mithril component.

All the Mithril components can be found under `lib/ui` and there aren't that many of them. We try to use Typescript to make sure their parameters are typed so they're
picked up by API documentation. No need for custom documentation for view components. Mithril components are just plain old JavaScript objects with a `view` method. 

Most components are explicitly passed a reference to the Workbench. Typically components just use this to execute commands, but can also pull data as well. Not just the
current Workspace, but also the Context. The Context represents certain values in a given context. The Workbench provides a top level context that has the current selected
node or nodes, the current panel, etc. However, when passing a Context around it can be given overrides. For example, you may be currently editing a particular node, but you
use the mouse to perform a command on another node. The menu ensures the command will receive a Context with that node being acted on. 

There is also a design system used in the UI based on CSS custom properties. This is inspired by projects like [Pollen](https://www.pollen.style/), where instead of generating
CSS classes from JavaScript like Tailwind (which requires a compile step and Node.js based tooling), we simply use and override CSS custom properties. This means they can 
be used in inline styles as well. We also have a subset of common Tailwind utility classes defined, though using the custom properties. 

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

```typescript
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