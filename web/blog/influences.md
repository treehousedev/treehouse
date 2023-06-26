---
layout: layouts/blog.tsx
title: "Treehouse Influences"
author: "Jeff Lindsay"
date: "2023-04-20"
---

Over the past few months, we've built a frontend framework for an elegant, quality outliner that's open source, extensible, and gives you control of your data. I’d like to share some of the design influences for the Treehouse frontend, which should give a sense of the unique direction Treehouse is going from here. 

The biggest influences for Treehouse are Tana, Notion, and Obsidian. These three represent the state of the art of personal and collaborative information management, sometimes simplified as note-taking tools. However, "note-taking tools" sells them short as they go beyond note-taking and information management. For lack of a better descriptor, many consider them [tools for thought](https://www.forthought.tools/).

## From Notes to Tools for Thought

For most, note-taking brings to mind simple apps like Apple Notes and Google Keep, or even just a text file editor. These work well for people because they're already there and focus on quick and easy plain text capture. We could call this casual note-taking. 

Back in the 2000s, hosted and self-hosted wikis became popular for easy, collaborative web publishing and knowledge management. Like Wikipedia, they could be used to build out hyperlinked knowledge repositories. Many wiki-based tools focused on their use as personal notebooks, one of the most influential examples being [TiddlyWiki](https://tiddlywiki.com/). The simple versatility of the wiki laid the groundwork for what we call "tools for thought" today.

![TiddlyWiki screenshot](https://treehouse.sh/photos/blog/tiddlywiki.png)

When [Notion](https://www.notion.so/) appeared in the mid-2010s, it built on the idea of the wiki and introduced structured data management with flexible views that *effectively gave you integrated, customizable versions of other productivity tools*. Notion, Airtable, and others helped bring in the age of no-code and low-code tools, allowing knowledge workers and entrepreneurs to build their own "apps" or solutions to problems without traditionally building software. Notion brought it all together in a simple, user-friendly experience based around the core idea of wiki-like information management.

![Notion screenshot](https://treehouse.sh/photos/blog/notion.jpeg)

Meanwhile, a separate paradigm of note-taking tools emerged, focusing on the nested, tree-like structure of the outline. Perhaps inspired by tools like [OmniOutliner](https://www.omnigroup.com/omnioutliner/) and [Org Mode](https://orgmode.org/) for Emacs of the 2000s, [Workflowy](https://workflowy.com/) appeared in 2010 as a no-frills web-based outliner. 

![Workflowy screenshot](https://treehouse.sh/photos/blog/workflowy.png)

[Obsidian](https://obsidian.md/) arrived in 2020 and is a local app focusing on Markdown files stored on your filesystem. Obsidian has a large plugin ecosystem giving it a wide breadth of features, but it’s especially appealing to those that want to own their data. If you strip away the plugins, Obsidian is a pretty simple hyperlinked Markdown editor.

![Obsidian screenshot](https://treehouse.sh/photos/blog/obsidian.png)

Most recently, a tool in early access called [Tana](https://tana.inc/) caught my attention. Their key innovation is taking the linked outline model of Workflowy and introducing schemas for nodes, making them into structured data. This gives Tana the embedded database functionality of Notion and Airtable, a step towards bringing the two paradigms of note-taking software together towards powerful, malleable tools for thought.  

![Tana screenshot](https://treehouse.sh/photos/blog/tana.webp)

## How Treehouse Fits In

By now there's no shortage of options in this space, both as SaaS and open source. Take a look at this growing [encyclopedia of note-taking tools](https://noteapps.info/). Like Notion and Tana, many of the apps listed are much more than note-taking tools. Some lean into the framing of "collaborative documents", and some are just categorized more generally as "productivity tools". Tana goes so far as to say "the everything OS". 

Note-taking is just the beginning. It's a tangible gateway for something more powerful inherent to computing. Ever since Engelbart's [mother of all demos](https://en.wikipedia.org/wiki/The_Mother_of_All_Demos), the computing revolution seems to start with powerful tools for thought, which are, at minimum, good note-taking tools.

![Engelbart using NLS](https://treehouse.sh/photos/blog/nls.jpeg)

Treehouse is a frontend and starter kit for anybody else that wants to explore this space with us. We will release a standalone product based on it soon, but most of the user-facing development will be done in the open source Treehouse project. 

![Treehouse screenshot](https://treehouse.sh/photos/hero-image.png)

Today with Treehouse you can build your own Workflowy equivalent, but soon it will become more comparable to Tana and Notion with the open extensibility of Obsidian. That alone is pretty exciting to have in a minimal open source project, but I can't wait to show you what will come next. 

## Coming Soon

In the next post, I'll start getting technical and share details on the Treehouse project stack and architecture. If you can't wait, we do have [documentation](https://treehouse.sh/docs/dev/) for you to check out. 

Thanks for reading, and a big thanks to my [sponsors](https://github.com/sponsors/progrium) for supporting this kind of open source work. Share your thoughts and favorite note-taking tools in the [discussion thread](https://github.com/treehousedev/treehouse/discussions/95) for this post.