// src/plugin.ts
import { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { DEFAULT_OPTIONS, RESOLVED_VIRTUAL_ROUTE_MODULE_ID, VIRTUAL_ROUTE_MODULE_ID } from './constants';
import {naviloOptions, RouteFile} from './types';
import { findRouteFiles } from './generator/createRoutes';
import {RouteTreeBuilder} from "./generator/parser/routeTreeBuilder";
import {RouteDefinitionGenerator} from "./generator/parser/routeDefinitionGenerator";

export function navilo(options: naviloOptions = {}): Plugin {
    const resolvedOptions = { ...DEFAULT_OPTIONS, ...options };
    let root: string;
    const routeTreeBuilder = new RouteTreeBuilder();

    return {
        name: 'navilo',

        configResolved(config) {
            root = config.root;
        },

        configureServer(server) {
            const pagesDir = path.resolve(root, resolvedOptions.pagesDir);

            server.watcher.add(pagesDir);

            const handleFileChange = (file: string) => {
                if (file.startsWith(pagesDir)) {
                    const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ROUTE_MODULE_ID);
                    if (module) {
                        server.moduleGraph.invalidateModule(module);
                    }
                    server.ws.send({ type: 'full-reload' });
                }
            };

            server.watcher.on('add', handleFileChange);
            server.watcher.on('unlink', handleFileChange);
            server.watcher.on('change', handleFileChange);
        },

        resolveId(id) {
            if (id === VIRTUAL_ROUTE_MODULE_ID) {
                return RESOLVED_VIRTUAL_ROUTE_MODULE_ID;
            }
        },

        async load(id) {
            if (id === RESOLVED_VIRTUAL_ROUTE_MODULE_ID) {
                const pagesDir = path.resolve(root, resolvedOptions.pagesDir);

                if (!fs.existsSync(pagesDir)) {
                    fs.mkdirSync(pagesDir, { recursive: true });
                    return `export const router = null;`;
                }

                const routes = await findRouteFiles(pagesDir);

                if (routes.length === 0) {
                    return `export const router = null;`;
                }

                const routeTree = routeTreeBuilder.build(routes, {
                    strict: true,
                    dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
                });

                const routeDefinitions = RouteDefinitionGenerator.generate(routeTree);

                return routerJSX(routes, routeDefinitions);
            }
        }
    };
}

export function routerJSX(routes: RouteFile[], routeDefinitions: string): string {
    const importMap = new Map<string, string>();
    routes.forEach(route => importMap.set(route.filePath, route.componentName));

    const imports = Array.from(importMap.entries())
        .map(([filePath, componentName]) => `import ${componentName} from '${filePath}';`)
        .join('\n');

    return `
import React, { Suspense } from 'react';
import { createBrowserRouter, useParams, Outlet, useRouteError, isRouteErrorResponse } from 'react-router-dom';
${imports}

function ErrorBoundary({ Component }) {
    const error = useRouteError();
    const params = useParams();

    if (!Component) {
        return React.createElement('div', { className: 'error-container' },
            React.createElement('div', { className: 'error-content' }, [
                React.createElement('h1', null, 
                    isRouteErrorResponse(error) ? \`\${error.status} - \${error.statusText}\` : 'Error'
                ),
                React.createElement('pre', { className: 'error-stack' },
                    error instanceof Error ? error.stack : JSON.stringify(error, null, 2)
                ),
                React.createElement('button', {
                    onClick: () => window.location.reload()
                }, 'Try again')
            ])
        );
    }

    return React.createElement(Component, { error, params });
}

function LoadingBoundary({ Component, children }) {
    if (!Component) {
        return children;
    }

    return React.createElement(Suspense, {
        fallback: React.createElement(Component)
    }, children);
}

function RouteWrapper({ Component, isLayout, loading, notFound }) {
    const params = useParams();
    
    if (isLayout) {
        const outlet = React.createElement(Outlet);
        const content = loading ? 
            React.createElement(LoadingBoundary, { Component: loading }, outlet) :
            outlet;

        return React.createElement(Component, {
            children: content,
            params
        });
    }
    
    return React.createElement(Component, { params });
}

// Add global error listener
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Add global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

const router = createBrowserRouter([
${routeDefinitions}
], {
    defaultErrorElement: React.createElement(ErrorBoundary, { Component: ${routes.find(r => r.type === 'not-found')?.componentName || 'null'} })
});

export { router };
`;
}