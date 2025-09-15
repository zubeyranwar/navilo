import { RouteNode } from "../../types";

export class RouteDefinitionGenerator {
    static generate(node: RouteNode, indent = '  '): string {
        const childNodes = Array.from(node.children.values());
        const children: string[] = [];

        if (node.indexPage) {
            children.push(this.generateIndexRoute(node, indent));
        }

        children.push(...childNodes.map(child =>
            this.generate(child, indent + '    ')
        ));

        return this.generateRouteObject(node, children, indent);
    }

    private static generateIndexRoute(node: RouteNode, indent: string): string {
        return `${indent}    {
${indent}      index: true,
${indent}      element: React.createElement(RouteWrapper, {
${indent}        Component: ${node.indexPage}
${indent}      })
${indent}    }`;
    }

    private static generateRouteObject(node: RouteNode, children: string[], indent: string): string {
        const pathStr = node.fullPath;
        const elementStr = this.generateElementString(node, indent);
        const errorStr = this.generateErrorString(node, indent);

        return [
            `${indent}{`,
            `${indent}  path: '${pathStr}'${elementStr}${errorStr}`,
            children.length > 0 ? `,\n${indent}  children: [\n${children.join(',\n')}\n${indent}  ]` : '',
            `${indent}}`
        ].filter(Boolean).join('');
    }

    private static generateElementString(node: RouteNode, indent: string): string {
        if (!node.layout && !node.component) return '';

        const props = node.layout
            ? this.generateLayoutProps(node, indent)
            : this.generateComponentProps(node, indent);

        return `,\n${indent}  element: React.createElement(RouteWrapper, ${props})`;
    }

    private static generateLayoutProps(node: RouteNode, indent: string): string {
        return `{
${indent}    Component: ${node.layout},
${indent}    isLayout: true,
${indent}    loading: ${node.loading || 'undefined'},
${indent}    notFound: ${node.notFound || 'undefined'}
${indent}  }`;
    }

    private static generateComponentProps(node: RouteNode, indent: string): string {
        return `{
${indent}    Component: ${node.component}
${indent}  }`;
    }

    private static generateErrorString(node: RouteNode, indent: string): string {
        if (!node.error) return '';

        return `,\n${indent}  errorElement: React.createElement(ErrorBoundary, {
${indent}    Component: ${node.error}
${indent}  })`;
    }
}