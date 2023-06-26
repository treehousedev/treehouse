---
layout: layouts/blog.tsx
title: "Welcome to Treehouse"
author: "Jeff Lindsay"
date: "2023-02-23"
---
I'm excited to announce the start of a new major project that I'll be sharing the journey of on this fancy new blog. The project is called [Treehouse](https://treehouse.sh/), which is starting as an open source note-taking frontend and will evolve into something much more.

![Treehouse screenshot](https://treehouse.sh/photos/hero-image.png)

We're creating a simple, hackable kernel of a note-taking tool as a web frontend that can be extended and customized by developers. Then we'll use that frontend to build a new kind of note-taking product. Today we have an early preview of our first minimum viable prototype of the frontend, and we'll be finishing up this release in the open on GitHub.

The [open source project](https://github.com/treehousedev/treehouse) is a functional app frontend that you can deploy and back in various ways. For developers, this "bring your own backend" approach makes Treehouse a great starting point to build your own note-taking tool, just as we intend to do. We also have pre-made backends for those who want to use it with little-to-no programming. Either way, you'll always own your data, and now the system presenting it to you as well. 

In this post, I'm going to talk about our minimum viable prototype and the approach we're taking with Treehouse as an open source project.

## Out of the Box

While inspired by powerful tools like [Notion](https://www.notion.so/), [Tana](https://tana.inc/), and [Obsidian](https://obsidian.md/), we wanted to boil our initial goal down to the essentials while still being usable enough to use ourselves. As we continue to plan our prototype release milestone, we'd love to hear what you think is essential for you to have in a tool and platform like this, but here is what to expect as a baseline.

### Outliner with Markdown Pages

At the heart of Treehouse is a graph-like system I've been developing called Manifold. This will play a big part in the long-term extensibility of Treehouse, which I'll talk more about in the future. For now, this maps very cleanly to the outliner model popularized by Workflowy, Tana, and others.

However, I'm also a fan of Notion-style pages and Obsidian's commitment to working with plain Markdown files. The Manifold system allows us to make certain nodes into Markdown pages. This hybrid model gets us the best of both worlds with room for even more possibilities later on.

### Quick Add and Daily Notes

Being able to quickly get thoughts and information into the system has been a key aspect of every good note-taking system. This can be exposed a number of ways from browser extensions to desktop shortcuts, but what makes any "quick add" functionality quick is not having to think about where it will be organized.

Luckily, "daily notes" has become such a common pattern that many recent tools have managed daily notes built-in. This typical gives you a "today" note that is automatically organized into a calendar-like structure. This conveniently becomes the perfect destination for "quick add" notes.

### Full-text Search

Whether you are an obsessive organizer or are too busy to take the time, solid full-text search is basically a necessity. It's how we quickly get to our data. 

Out of the box we have a full-text search that doesn't require a backend. However, our pluggable backend will allow you to power search in a number of ways, and also opens up the ability to search into external systems that are important to you.

### Built-in Backends

"Bring your own backend" is a critical part of the design of this project, but Treehouse also needs to be usable by people who prefer not to *build* their own backend. Our prototype release is planned to include a handful of built-in backends to get started with.

Our preview demo is using a localStorage backend, which works for development and special use cases. Of course, we will have a simple local filesystem backend for desktop scenarios, similar to Obsidian.

However, we're most excited for the GitHub backend. This functions similarly to the local filesystem backend, but it would be versioned in a central repository on your GitHub account and be accessible on any online platform.

Backends will not only let you extend storage, search, and authentication, but other aspects in the future. 

## Project Overview

The Treehouse codebase and open source project is as much the product as its features. The entire user and developer experience is being designed around simplicity and human ergonomics.

The Treehouse frontend is built with web technologies intended for use across web, mobile, and desktop platforms. The project is written in TypeScript using [Deno](https://deno.land/) as its JavaScript toolchain.

The JavaScript ecosystem is a mess, but Deno provides a forward-looking, self-contained toolchain that's easy to love. We actually have a zero Node.js policy and avoid NPM modules as much as possible.

With minimal dependencies and an ongoing effort to keep the codebase small, it will always be easy to understand the entire Treehouse system. This will be further supported with a focus on documentation, both API docs and guides.

We're using a permissive open source license, allowing you to use or change our code as you see fit. Contribution and participation is welcome, but so is simply consuming downstream. 

The project is actively being developed but we keep a [preview demo](https://treehouse.sh/demo/) running off the main branch that should always be in working order.

## Coming Soon

I'm excited to give you a deeper look at the project stack in a future post. For now, keep an eye out for the next post digging into the influences for Treehouse. We'll also try to answer "why another note-taking tool", and tease some long-term ideas for the future.

Lastly, I want to mention the project is being developed in the open, not just with the code on GitHub, but most of my work is streamed and archived on [Twitch](https://www.twitch.tv/progrium). Feel free to come and co-work with me.

Thanks for reading, and a big thanks to my [sponsors](https://github.com/sponsors/progrium/) for supporting this kind of open source work. 