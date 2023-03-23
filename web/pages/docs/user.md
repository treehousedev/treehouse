---
layout: docs
---
# User Guide

## What is Treehouse?

Treehouse is an outline editor, which you can think of as a nested bulleted list. Each bullet item is called a **node**. You can use the nodes to create nested layers of folders and notes.

## Data storage

### Localstorage

By default, data is stored in your browser’s local storage. That means that the data is linked to your specific browser and device. If you clear your browser cache, the data will be wiped.

### GitHub

If you choose to log in with GitHub, we’ll create a repository and store your data there.

To store your workspace, we will create a public repository called <username>.treehouse.sh if it doesn’t already exist. If you want to make the repository private, you can do so in GitHub.

To switch back to the local storage backend, log out from the Options menu.

#### Multiple sessions

If you log in to Treehouse from multiple devices, the most recent device will have edit and save access. Other sessions will be prompted to refresh the page; if/when you do so, that session becomes the new active session.

## Nodes

Your **Workspace** is your top level node, which all other nodes are nested under.

Learn how to manage and edit your nodes.

### Add

You can add a new node in a few ways.

1. Hit ENTER on your keyboard and start typing.
2. Click into the blank area next to the plus symbol and start typing.

### Indent

* Indent a node using TAB ↹
* Outdent a node using SHIFT + TAB ⇧ ↹

### Move

* Move a node up with SHIFT + COMMAND + UP ARROW ⇧ **⌘ ↑**
* Move a node down with SHIFT + COMMAND + DOWN ARROW ⇧ **⌘** ↓

### Expand or collapse a node

If a node bullet has an outline around it, that’s an indication that it has nested content that is currently hidden. Click the node to expand it. 

Click an expanded node once to collapse it.

### Node menu

When you hover over a node, you’ll see a menu to the left of the node bullet. Click it to access node options, such as indent/outdent, open in a panel, etc.

### Node formatting

Currently, all nodes are formatted as plain text. You can, however, add a checkbox to a node. With a node selected, open the command palette (⌘ K) and select "Add checkbox".

### View

Double click a node to zoom in.

### Side-by-side (Panel) view

To view two nodes side-by-side:

Open the node you want to be in the righthand panel. From its menu, choose “Open in New Panel”.

You can close or expand either panel to return to a single panel view.

## Calendar

The Calendar is a default node that is automatically generated for every workspace. Nodes inside the calendar are grouped by date, week, then year.

### Today

The Today shortcut allows you to quickly view the node for Today in your Calendar.

### Quick Add

Quick Add in the top navigation is a shortcut that opens a modal in which you can jot a quick note. It will be added to today’s date in your Calendar. 

## Command Palette

With a node selected, open the command palette (⌘ K) to view all the available actions for that node.

## Keyboard shortcuts

<table border="1" cellpadding="8">
<tbody>
<tr>
<td>indent</td>
<td>↹</td>
</tr>
<tr>
<td>outdent</td>
<td>⇧ ↹</td>
</tr>
<tr>
<td>move node up</td>
<td>⇧ ⌘ ↑</td>
</tr>
<tr>
<td>move node down</td>
<td>⇧ ⌘ ↓</td>
</tr>
<tr>
<td>delete node</td>
<td>⇧ ⌘ ⌫</td>
</tr>
<tr>
<td>add or remove checkbox</td>
<td>⌘ ↵</td>
</tr>
<tr>
<td>mark checkbox as done</td>
<td>⌘ ↵</td>
</tr>
<tr>
<td>open command palette</td>
<td>⌘ K</td>
</tr>
</tbody>
</table>

## Backend Extensions

Backends can change or extend how a Treehouse application behaves and are exposed to the frontend via adapters.

### Workspace Storage

The Treehouse frontend uses its backend adapter to store the state of your workspace into a JSON document. The backend can decide where and how that JSON document is stored. For example, the Browser backend adapter will store the JSON into localStorage.

### User Authentication

An optional capability of the frontend is to know whether a particular user is authenticated. You typically want user authentication for cloud or web-based deployments, but not necessarily for a local desktop app.

### Search Indexing

Out of the box, Treehouse will index your workspace for full-text search using [Minisearch](https://lucaong.github.io/minisearch/),
which will be good enough for many cases. However, a backend adapter can choose to hook into the index and searching
so that you could have a more powerful search index such as ElasticSearch. 


