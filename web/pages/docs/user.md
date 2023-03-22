---
layout: docs
---
# User Guide

## Using the Interface

In short, the Treehouse interface lets you view and manipulate workspaces, which are explained in the next section.
In this section, we'll go over the basic elements of the interface.

### Outline Editor

The main element of the interface is the outline editor. This is where the majority of interaction with workspace
nodes happens and behaves similar to Workflowy, Tana, and other outliners. Nodes with children can be expanded
to be viewed inline, etc. For the most part, nodes can be edited as if they were an outline in a text editor.

For every node there is a menu dropdown that can be used to access basic commands that can be performed on a node.
You can also perform these commands via keyboard shortcuts or the command palette, which are talked about in more
detail below.

### Panels

The outline editor is typically shown inside a panel. Typically there is just one main panel, but you have the 
option to open nodes in new panels so you can work with different parts of the workspace side-by-side. When multiple
panels are open you can close a panel, or expand it, which closes all other panels. 

You can also "zoom" into a child node of the outline in a panel, making it the top level node for a panel. When
you do this, you can go "back" to zoom back out to the previous node the panel was focused on.

### Navigation Bar

The navigation bar on the left shows the top nodes of your workspace, allowing them to function as navigation items.
This bar can be collapsed if not needed.

### Top Bar

The top bar provides immediate search, quick links to special functionality, and a main menu. This is self explanatory
other than the special functionality:

* **Today** - This takes you to a special node representing the current date, which is automatically organized under the Calendar node.
* **Quick Add** - This brings up a modal for quickly adding to your workspace without thinking about where it will be put. Currently,
this will append it to the Today node for that day.

## Keyboard Shortcuts

All user operations in Treehouse are encapsulated as commands, which are exposed via menus or the command palette, but can also be triggered
directly by keyboard shortcuts. Here is a list of the default keyboard shortcuts:

* TODO

## Command Palette

You can bring up the command palette with its keyboard shortcut to access any command that can be run at that time. The command palette is
aware of what node and panel is currently selected. If no node is actively being edited, it will show commands for the top level node of the
main panel.

## Workspace Model

The "document" of Treehouse is the workspace, which is just a network of nodes. Right now, nodes are mostly just text nodes, but nodes can also
represent more than text. For example, you can add a checkbox to a node, which adds a checkbox "component" to a node. So to better reason about
workspace nodes, let's go over the basic rules of a workspace:

#### Everything is a node

Once again, everything is a node. The navigation for your workspace comes from the top level nodes of your workspace. As new functionality is added
to Treehouse, they will also be represented as nodes. 

#### Nodes can have children

As you'd expect from any outliner or tree-like structure, any node can have child nodes that belong to that parent node. 

#### Nodes can be pages

When you open a node from navigation or by double-clicking any node, you're opening a panel rooted in that node. In that way, the node becomes a page. 

#### Nodes can have checkboxes

Adding a checkbox to a node adds a checkbox component to the node with the state of that checkbox. The outline editor knows to show nodes with checkbox
components as having a checkbox at the beginning of the text.

#### Nodes can have Markdown

Although all node text *should* eventually support Markdown, for the moment, you can add a Markdown component to a node that contains Markdown text. 
This is shown when you open a node as a page above the usual outline. 

#### Nodes can be more...

New kinds of nodes are simply nodes with new kinds of components. This is not fully utilized yet, but is mentioned as a taste of things to come.

## Backend Extensions

Your user experience may vary depending on the deployment of the Treehouse frontend. Backends can 
change or extend how a Treehouse application behaves and are exposed to the frontend via adapters.
Below are some of the ways a backend can change the user experience.

### Workspace Storage

The Treehouse frontend uses its backend adapter to store the state of your workspace into a JSON document.
The backend can decide where and how that JSON document is stored. For example, the Browser backend adapter
will store the JSON into localStorage, the GitHub backend adapter will store it into a file in a GitHub hosted
repository, etc. This is the biggest part of what a backend adapter provides.

### User Authentication

An optional capability of the frontend is to know whether a particular user is authenticated. This is optional
because, for example, in a local desktop application you may not want (or even expect) to need to login to use this 
frontend. However, for cloud or web-based deployments, you typically want user authentication and some backends
will require it, such as the GitHub backend.

### Search Indexing

Out of the box, Treehouse will index your workspace for full-text search using [Minisearch](https://lucaong.github.io/minisearch/),
which will be good enough for many cases. However, a backend adapter can choose to hook into the index and searching
so that you could have a more powerful search index, like for example ElasticSearch. 
