---
layout: layouts/docs.tsx
title: Workbench UI
---
## Workbench UI

### Components

The workbench UI is made up of Mithril components, which are similar to React components. They take parameters, can have state, and specify a view using JSX. Instead of many atomic components like buttons and labels, Treehouse focuses on larger functional components that map to areas of the UI. Reusable visual elements are represented by CSS classes. Only if a reusable atomic visual element becomes so re-used and is too complex to re-implement is it made into a Mithril component.

All the Mithril components can be found under `lib/ui`. We use Typescript to make sure their parameters are typed so they're picked up by API documentation; no need for custom documentation for view components. Mithril components are just plain old JavaScript objects with a `view` method. 

### User Context

Most components are explicitly passed a reference to the Workbench, which they can use to execute commands or pull data in the current Workspace or Context. The Workbench provides a top level context that has the current selected node or nodes, the current panel, etc. However, when passing a Context around it can be given overrides. For example, you may be currently editing a particular node, but you use the mouse to perform a command on another node. The menu ensures the command will receive a Context with that node being acted on. 

### Design System

Our design system is inspired by projects like [Pollen](https://www.pollen.style/), where instead of generating CSS classes from JavaScript like Tailwind (which requires a compile step and Node.js based tooling), we simply use and override CSS custom properties. This means they can be used in inline styles as well. We also have a subset of common Tailwind utility classes defined, though using the custom properties.