---
layout: layouts/docs.tsx
title: User Actions
---
## User Actions

All user performable actions are modeled as commands and registered with a command system. Commands are  functions with some extra metadata, like a user displayable name and system identifier. They can be called throughout the system by their system identifier, such as when a user clicks a something.

Menus are often defined upfront, usually by commands. Commands can have keybindings registered for them for keyboard shortcuts. These systems work together. For example, a menu item for a command will show the keybinding for it. 

Commands can take arguments and usually take at least a single argument called a context. This is a way to represent state of the user’s current context, such as the currently selected node. 

In addition to menus, keyboard shortcuts, and UI event handlers, there is a command palette the user can trigger to show all commands that can be run in the current context.