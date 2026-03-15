---
order: 1
title: Introduction
description: A Vite plugin that adds file-based routing to React apps by wrapping React Router.
icon: book
---

# Introduction

Navilo is a Vite plugin that adds file-based routing to your React applications, inspired by the simplicity and power of Next.js's App Router. It automatically generates a route tree from your directory structure, making it easier to manage and scale your projects.

## Features

- **Automatic File-Based Routing** — No manual route configuration needed.
- **Nested Routes & Layouts** — Easily create complex UI structures with nested layouts.
- **Dynamic Segments** — Support for `[id]`, catch-all `[...slug]`, and optional catch-all `[[...slug]]` routes.
- **Index Pages** — `page.tsx` files serve as the index for a directory.
- **Grouped Folders** — Organize your code without affecting the URL structure (e.g., `(group)`).
- **Special Pages** — Built-in support for `loading.tsx`, `error.tsx`, and `not-found.tsx` pages.

---

## Quick Start

Get up and running in under a minute with the CLI:

```bash
npx navilo init
```

This will automatically configure your Vite project, install dependencies, and set up the necessary files.

---

## Next Steps

- Read the [Getting Started](/docs/get-started) guide to set up Navilo manually.
- Explore [Core Concepts](/docs/core-concepts) to understand how Navilo works.
