import {SegmentParser} from './segmentParser';
import {ParserOptions, RouteFile, RouteNode} from "../../types";

export class RouteTreeBuilder {
    private readonly typeSetters: Record<string, (node: RouteNode, route: RouteFile) => void>;

    constructor() {
        this.typeSetters = {
            layout: (node, route) => {
                node.layout = route.componentName;
            },
            error: (node, route) => {
                node.error = route.componentName;
            },
            loading: (node, route) => {
                node.loading = route.componentName;
            },
            'not-found': (node, route) => {
                node.notFound = route.componentName;
            },
            page: this.handlePageType.bind(this)
        };
    }

    build(routes: RouteFile[], options?: ParserOptions): RouteNode {
        const root: RouteNode = {
            segment: '',
            path: '/',
            fullPath: '/',
            children: new Map(),
            metadata: options?.metadata
        };

        const sortedRoutes = this.sortRoutes(routes);
        sortedRoutes.forEach(route => {
            this.processRoute(root, route, options);
        });

        return root;
    }

    private sortRoutes(routes: RouteFile[]): RouteFile[] {
        return [...routes].sort((a, b) =>
            a.type === 'layout' && b.type !== 'layout' ? -1 :
                a.type !== 'layout' && b.type === 'layout' ? 1 : 0
        );
    }

    private processRoute(root: RouteNode, route: RouteFile, options?: ParserOptions): void {
        const segments = route.segments.map(seg => String(seg));

        if (segments.length === 0) {
            this.applyTypeHandler(root, route);
            if (route.type === 'page') root.isIndex = true;
            return;
        }

        let current = root;
        let currentPath = '';

        segments.forEach((seg, idx) => {
            const isLast = idx === segments.length - 1;
            const key = SegmentParser.normalize(seg, options);

            if (key === null) return;

            currentPath = this.buildFullPath(currentPath, key);

            if (!current.children.has(key)) {
                current.children.set(key, {
                    segment: key,
                    path: key,
                    fullPath: currentPath,
                    children: new Map(),
                    metadata: options?.metadata
                });
            }

            current = current.children.get(key)!;

            if (isLast) this.applyTypeHandler(current, route);
        });
    }

    private buildFullPath(currentPath: string, key: string): string {
        if (currentPath === '' || currentPath === '/') {
            return key === '' ? '/' : `/${key}`;
        }
        return `${currentPath}/${key}`;
    }

    private applyTypeHandler(node: RouteNode, route: RouteFile): void {
        const handler = this.typeSetters[route.type];
        if (handler) handler(node, route);
    }

    private handlePageType(node: RouteNode, route: RouteFile): void {
        const baseName = route.filePath.split('/').pop() || '';
        const isPageFile = /^page\.(jsx|tsx)$/.test(baseName);

        if (isPageFile) {
            const lastSegment = route.segments[route.segments.length - 1];
            const isDynamic = lastSegment?.startsWith('[');

            if (isDynamic) {
                node.component = route.componentName;
                node.isIndex = false;
                return;
            }

            node.indexPage = route.componentName;
            return;
        }

        const lastSegment = route.segments[route.segments.length - 1];
        const isDynamic = lastSegment?.startsWith('[');

        if (isDynamic) {
            node.component = route.componentName;
            node.isIndex = false;
            return;
        }

        node.indexPage = route.componentName;
    }
}