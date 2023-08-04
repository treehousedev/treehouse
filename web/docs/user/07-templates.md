---
layout: layouts/docs.tsx
title: Templates
---
## Templates

Templates allow you to add a set of predefined fields and other child nodes to a node simply by adding a tag to that node.

### Create and use a template

In this example, we'll create a template called "book" with child fields Author and Release Date.

1. Wherever you want to store your template, type "book" in the node.
2. Add child fields Author and Release Date, and leave the value fields empty. (To turn a regular node into a Field: Command Palette > Create field) 
3. With your cursor in the parent "book" node, open the Command Palette (Command/Control+K) and choose Make Template.
4. Create a list of books wherever you'd like, if you haven't already. With your cursor on one if the individual books, type "#book" and hit ENTER to create the tag.
5. Check out one of your book nodes—it should have the child fields Author and Release Date that you set up in your template.