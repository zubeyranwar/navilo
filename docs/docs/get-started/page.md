---
order: 2
title: Getting Started
description: Learn how to install and configure Navilo in your project.
icon: rocket
---

# Getting Started

This guide will walk you through the process of setting up Navilo in your Vite + React project.

## Installation

First, add Navilo to your project:

```bash
pnpm add navilo
```

Since Navilo is a wrapper around React Router, you'll also need to install it:

```bash
pnpm add react-router-dom@^6.16.0
```

## Vite Configuration

Next, add Navilo to your Vite plugins in `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import navilo from 'navilo';

export default defineConfig({
  plugins: [
    react(),
    navilo({
      pagesDir: 'src/app', // default directory to scan
    }),
  ],
});
```

## Type Declarations

To ensure TypeScript recognizes the virtual module, add the following to your `vite-env.d.ts` file:

```ts
/// <reference types="vite/client" />

declare module 'virtual:navilo-routes' {
  export const router;
}
```

## App Entry Point

Finally, update your main `App.tsx` to use the router provided by Navilo:

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from 'virtual:navilo-routes';

export function App() {
    return (
        <RouterProvider router={router} />
    );
}
```

That's it! You can now start creating pages in your `src/app` directory.
