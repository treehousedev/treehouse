---
layout: layouts/docs.tsx
title: Data Model
---
## Data Model

The "document" for Treehouse is the Workspace, which is  mostly a container for nodes. These nodes are based on a versatile and extensible API and data model called Manifold. In short, nodes:

* have a unique ID
* have a text name
* can be children to other nodes
* can have key-value attributes
* can have components

Most importantly, nodes build a tree-like structure where each node can be extended with components. Components extend the state and functionality of a node. For example, a checkbox component can be added to a node. This gives it a state (checked or not) and allows the UI to render it differently (add a checkbox).