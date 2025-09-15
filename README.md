# Navilo

![npm](https://img.shields.io/npm/v/navilo?color=brightgreen)
![License](https://img.shields.io/npm/l/navilo)
![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D5.0-blue)

**A Vite plugin that adds file-based routing to React apps by wrapping React Router (peer dependency)**

---

## Installation

```bash
pnpm add navilo
```

Navilo automatically generates a route tree from your `src/app` (or custom) directory structure, including support for:

* Automatic file-based routing like Next js app router
* Nested routes support
* Dynamic segments (`[id]`)
* Catch-all (`[...slug]`) and optional catch-all (`[[...slug]]`)
* Index pages
* Grouped folders (e.g., (group)) are ignored in routing
* Support for Loading, error, and not-found pages

**Peer dependencies:** React 18+, React Router 6+, Vite 4+

---

## Quick Start

### Vite Config
1. Install react router dom since its our peer dependency
```bash
npm install react-router-dom@6.16.0

```ts
2.Add the navilo to plugin in vite config

// vite.config.ts
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import navilo from 'navilo';

export default defineConfig({
    plugins: [
        react(),
        navilo({
            pagesDir: 'src/app',       // default directory to scan
        })
    ]
});
```

3. Add this vite-env.d.ts

```ts
/// <reference types="vite/client" />
declare module 'virtual:navilo-routes' {
    export const router;
}
```

4. Now import the router from virtual module

```tsx
import {RouterProvider} from "react-router-dom";
import {router} from 'virtual:preluder-routes';

export function App() {
    return (
        <RouterProvider router={router}/>
    );
}
```

5. 🎉 Volla now you can now use it like next js

### Directory Structure Example

```
src/app/
├─ layout.tsx          # Root layout
├─ page.tsx            # Root index page
├──(group)/            # Grouped folder (ignored)
│  └── about/page.tsx
├─ dashboard/
│  ├─ layout.tsx       # Dashboard layout
│  ├─ page.tsx         # Dashboard index page
│  ├─ [userId]/        # Dynamic segment
│  │  └─ settings/
│  │     └─ [tab].tsx  # Nested dynamic segment
├─ blog/
│  ├─ [id].tsx         # Dynamic blog page
│  ├─ [[...slug]].tsx  # Optional catch-all
```

Navilo generates a route tree automatically:

```ts
{
    segment: '',
        path
:
    '/',
        children
:
    Map
    {
        'dashboard'
    =>
        {
            segment: 'dashboard',
                layout
        :
            'DashboardLayout',
                indexPage
        :
            'DashboardPage',
                children
        :
            Map
            {
                ':userId'
            =>
                {
                    children: Map
                    {
                        'settings'
                    =>
                        {
                            children: Map
                            {
                                ':tab'
                            =>
                                {
                                    component: 'UserSettings'
                                }
                            }
                        }
                    }
                }
            }
        }
    ,
        'blog'
    =>
        {
            children: Map
            {
                ':id'
            =>
                {
                    component: 'BlogPost'
                }
            ,
                ':slug*?'
            =>
                {
                    component: 'BlogCatchAll'
                }
            }
        }
    }
}
```

---

## Dynamic Segment Transformation

```ts
const routeTree = routeTreeBuilder.build(routes, {
    dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
});
```

* `[userId]` → `:userid`
* `[...slug]` → `:slug*`
* `[[...slug]]` → `:slug*?`

---

## Supported Route Types

| Type        | Usage                              |
|-------------|------------------------------------|
| `layout`    | Layout component for nested routes |
| `page`      | Regular page component             |
| `loading`   | Loading UI for nested layouts      |
| `error`     | Error page for nested layouts      |
| `not-found` | 404 page                           |



