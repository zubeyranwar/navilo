import {RouteNode} from "../types";

type MatchResult = {
    component?: string;
    params: Record<string, string | string[]>;
};

export function matchPath(pathname: string, tree: RouteNode): MatchResult | null {
    const segments = pathname.split('/').filter(Boolean);
    let node: RouteNode | undefined = tree;
    const params: Record<string, any> = {};

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        let nextNode: RouteNode | undefined;

        if (node.children.has(segment)) {
            nextNode = node.children.get(segment);
        } else {
            for (const [key, child] of node.children.entries()) {
                if (key.startsWith(':')) {
                    if (key.endsWith('*')) {
                        const name = key.replace(/^:/, '').replace('*', '').replace('?', '');
                        const rest = segments.slice(i);
                        params[name] = key.endsWith('?') && rest.length === 0 ? undefined : rest;
                        nextNode = child;
                        i = segments.length;
                        break;
                    } else {
                        const name = key.replace(/^:/, '');
                        params[name] = segment;
                        nextNode = child;
                        break;
                    }
                }
            }
        }

        if (!nextNode) return null;
        node = nextNode;
    }

    return {
        component: node.component,
        params,
    };
}
