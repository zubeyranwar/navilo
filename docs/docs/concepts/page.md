---
order: 3
title: Core Concepts
description: Understand the fundamental concepts of Navilo.
icon: terminal
---

# Core Concepts

Navilo introduces a set of core concepts that make routing in React applications more intuitive and scalable.

## File-based Routing

Navilo uses the file system to define your application's routes. Every `.tsx` file in your `pagesDir` (default `src/app`) becomes a route.

### Directory Structure Example

```
src/app/
├─ layout.tsx          # Root layout
├─ page.tsx            # Root index page (/)
├──(group)/            # Grouped folder (ignored in URL)
│  └── about/
│     └── page.tsx     # /about
├─ dashboard/
│  ├─ layout.tsx       # Dashboard layout
│  ├─ page.tsx         # /dashboard
│  ├─ [userId]/        # Dynamic segment
│  │  └─ settings/
│  │     └─ page.tsx   # /dashboard/:userId/settings
```

## Supported File Types

Navilo recognizes special file names to create different types of routes:

| File Name     | Usage                               |
|---------------|-------------------------------------|
| `layout.tsx`  | Layout component for nested routes  |
| `page.tsx`    | A regular page component            |
| `loading.tsx` | Loading UI for a route segment      |
| `error.tsx`   | Error UI for a route segment        |
| `not-found.tsx`| 404 page for a route segment      |

## Dynamic Segments

To create a dynamic route, use square brackets in your folder or file name.

-   `[id].tsx` will match a dynamic segment, like `/blog/123`. The `id` will be available as a parameter.
-   `[...slug].tsx` is a catch-all route that will match any number of segments, like `/shop/a/b/c`.
-   `[[...slug]].tsx` is an optional catch-all route that will also match the root of the path.

Navilo transforms these segments into a format that React Router understands:

-   `[userId]` → `:userId`
-   `[...slug]` → `:slug*`
-   `[[...slug]]` → `:slug*?`
