---
layout: layouts/docs.tsx
title: Backend Extensions
---
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