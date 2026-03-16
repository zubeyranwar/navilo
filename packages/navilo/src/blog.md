## How Navilo (file-based routing npm package) works

Before diving into internals, here is the short reason I built Navilo.

I found myself using Next.js mainly for App Router style file-based routing, while I was not using the API layer in many of my projects. That made me think: why not keep React Router (already the standard in React apps) and build a parser/generator layer around it to get the same routing experience?

That idea became **Navilo**.

---

## The mental model in one line

Navilo scans files inside `src/app`, builds a route tree, converts it into React Router route definitions, and exposes it through a virtual module:

```ts
import { router } from 'virtual:navilo-routes';
```

---

## Typical app structure Navilo reads

```txt
src/app/
├─ layout.tsx
├─ page.tsx
├─ not-found.tsx
├─ blog/
│  └─ [...slug]/
│     └─ page.tsx
└─ dashboard/
   ├─ layout.tsx
   ├─ loading.tsx
   ├─ page.tsx
   └─ users/
      └─ [id]/
         └─ page.tsx
```

---

Let's take a look the package

### `src/constants.ts` (core constants)

Defines:

- default plugin options (`pagesDir: 'src/app'`)
- virtual module IDs (`virtual:navilo-routes` and resolved id)

Small file, but important because the whole plugin flow depends on these IDs.

---

### `src/types.ts` (shared contracts)

Contains core types like:

- `RouteFile`
- `RouteType`
- `RouteNode`
- `ParserOptions`
- `naviloOptions`

Think of this file as the schema between scan phase, parse phase, and generation phase.

---

### `src/generator/parser/segmentParser.ts` (segment syntax parser)

Converts folder/file segment syntax into route path tokens.

Examples:

- `[id]` -> `:id`
- `[...slug]` -> `:slug*`
- `[[...slug]]` -> `:slug*?`
- `(group)` -> ignored from path

This is the “Next.js like syntax interpreter” part of Navilo.

---

### `src/generator/createRoutes.ts` (file scanning + normalization)

This is where raw files become structured route metadata.

Main responsibilities:

- discover route files with `fast-glob`
- detect file type (`layout`, `page`, `error`, `loading`, `not-found`)
- normalize paths for cross-platform compatibility
- generate component names from file location
- extract route segments from file paths

Output: `RouteFile[]`.

(image)

---

### `src/generator/parser/routeTreeBuilder.ts` (builds hierarchical route tree)

Takes `RouteFile[]` and builds a nested `RouteNode` tree.

(image)

Key work here:

- creates nodes per normalized segment
- attaches `layout`, `error`, `loading`, and `notFound` handlers
- puts index pages into `indexPage`
- handles dynamic leaf routes using `component`

This file is the main core of navilo.

---

### `src/generator/parser/routeDefinitionGenerator.ts` (React Router code generation)

Transforms `RouteNode` tree into React Router route objects (as code string).

It also:

- generates index routes
- injects wildcard not-found routes
- propagates inherited `notFound`
- attaches route-level `errorElement`

So this is where parsed structure becomes executable router config.

---

### `src/plugin.ts` (Vite integration)

This file wires everything into Vite.

What it does:

1. resolves plugin options (`pagesDir`)
2. watches app files during dev server
3. invalidates virtual module on file changes
4. scans files with `findRouteFiles`
5. builds tree + definitions
6. returns generated module code exporting `router`

This is the runtime bridge between your filesystem and React Router.

---

### `src/utils/index.ts` (path matcher utility)

Contains `matchPath()` helper to match a URL pathname against the built tree and return:

- matched component
- extracted params (including catch-all arrays)

It is useful for parser behavior validation and utility scenarios.

---

## End-to-end example

Let’s say your app contains:

```txt
src/app/
├─ layout.tsx
├─ page.tsx
├─ not-found.tsx
└─ blog/
   └─ [id]/
      └─ page.tsx
```

### Step A: file discovery

`createRoutes.ts` detects each valid route file and creates `RouteFile[]`.

Example route metadata (conceptually):

```ts
[
  { type: 'layout', segments: [], componentName: 'RootLayout' },
  { type: 'page', segments: [], componentName: 'RootPage' },
  { type: 'not-found', segments: [], componentName: 'RootNotFound' },
  { type: 'page', segments: ['blog', '[id]'], componentName: 'BlogIdPage' }
]
```

### Step B: segment normalization

`segmentParser.ts` transforms:

- `blog` stays `blog`
- `[id]` becomes `:id`

### Step C: route tree build

`routeTreeBuilder.ts` builds a tree:

- root node has `layout` and `indexPage`
- child `blog` -> child `:id` with route component
- root `notFound` is attached

### Step D: route definition generation

`routeDefinitionGenerator.ts` emits React Router route definitions with:

- root route
- index route
- `/blog/:id` route
- wildcard `*` fallback using `RootNotFound`

### Step E: virtual module output

`plugin.ts` returns generated code for:

```ts
export { router };
```

Then in app code you just use:

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from 'virtual:navilo-routes';

export function App() {
  return <RouterProvider router={router} />;
}
```

---

## Why this architecture works well

- clear separation between scan, parse, tree, and generation
- parser logic is testable without Vite runtime
- plugin remains thin and focused on integration
- users get Next-like file routing while staying in React Router ecosystem

---

## Final takeaway

Navilo is not replacing React Router.

It is a developer-experience layer on top of React Router that converts file conventions into route definitions automatically. The result is a familiar file-based workflow with the flexibility and ecosystem compatibility of React Router.
