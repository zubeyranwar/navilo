export interface RouteFile {
    type: RouteType;
    path?: string;
    filePath: string;
    componentName: string;
    segments: string[];
}

export type RouteType = 'layout' | 'page' | 'error' | 'loading' | 'not-found';

export interface RouteNode {
    segment: string;
    path: string;
    fullPath: string;
    component?: string;
    indexPage?: string;
    layout?: string;
    error?: string;
    loading?: string;
    notFound?: string;
    children: Map<string, RouteNode>;
    isIndex?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ParserOptions {
    dynamicSegmentTransform?: (segment: string) => string;
    strict?: boolean;
    allowEmptySegments?: boolean;
    metadata?: Record<string, unknown>;
}

export interface naviloOptions {
    pagesDir?: string;
    typescript?: boolean;
    showErrorModal?: boolean;
}