import path from 'path';
import glob from 'fast-glob';
import { RouteFile, RouteType } from '../types';

/** Normalize Windows paths to forward slashes */
export function normalizeFilePath(filePath: string): string {
    return filePath.replace(/\\/g, '/');
}

/** Determine the type of a route file */
export function getRouteType(filePath: string): RouteType {
    const basename = path.basename(filePath);
    const fileTypes: Record<string, RouteType> = {
        'layout.jsx': 'layout',
        'layout.tsx': 'layout',
        'page.jsx': 'page',
        'page.tsx': 'page',
        'error.jsx': 'error',
        'error.tsx': 'error',
        'loading.jsx': 'loading',
        'loading.tsx': 'loading',
        'not-found.jsx': 'not-found',
        'not-found.tsx': 'not-found'
    };
    return fileTypes[basename] || 'page';
}

/** Generate a PascalCase component name based on folder structure */
export function getComponentName(filePath: string, pagesDir: string): string {
    const segments = normalizeFilePath(path.relative(pagesDir, filePath)).split('/');
    const fileNameWithExt = segments.pop()!;
    const fileName = path.basename(fileNameWithExt, path.extname(fileNameWithExt));

    const relevantSegments = segments.map(segment => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
            return segment.slice(1, -1)
                .replace(/^\.\.\./, 'CatchAll')
                .split(/[^a-zA-Z0-9]/)
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join('');
        }
        return segment
            .split(/[^a-zA-Z0-9]/)
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join('');
    });

    const typeSuffix = {
        page: 'Page',
        layout: 'Layout',
        error: 'Error',
        loading: 'Loading',
        'not-found': 'NotFound'
    }[fileName] || 'Component';

    return relevantSegments.length === 0 ? `Root${typeSuffix}` : `${relevantSegments.join('')}${typeSuffix}`;
}

/** Extract segments from file path for building route tree */
export function getPathSegments(filePath: string, pagesDir: string): string[] {
    const relativePath = normalizeFilePath(path.relative(pagesDir, filePath));
    const segments = relativePath.split('/');
    const fileName = segments.pop()!;

    const filteredSegments = segments.filter(seg => !(seg.startsWith('(') && seg.endsWith(')')));

    if (/^page\.(jsx|tsx)$/.test(fileName)) {
        filteredSegments.push('');
    }

    return filteredSegments;
}

/** Find all route files in the pages directory */
export async function findRouteFiles(pagesDir: string): Promise<RouteFile[]> {
    const files = await glob(['**/*.{jsx,tsx}'], {
        cwd: pagesDir,
        absolute: true,
        ignore: ['**/node_modules/**', '**/.*/**', '**/_*/**'],
    });

    const validFiles = files.filter(file => {
        const base = path.basename(file);
        return /^(layout|page|error|loading|not-found)\.(jsx|tsx)$/.test(base);
    });

    return validFiles.map(file => {
        const type = getRouteType(file);
        return {
            type,
            path: '/' + normalizeFilePath(path.relative(pagesDir, path.dirname(file))),
            filePath: normalizeFilePath(file),
            componentName: getComponentName(file, pagesDir),
            segments: getPathSegments(file, pagesDir),
        };
    });
}
