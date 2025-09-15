import {describe, expect, it} from 'vitest';
import {RouteTreeBuilder} from '../generator/parser/routeTreeBuilder';
import {matchPath} from "../utils";
import {RouteType} from "@/types";

describe('File-based routing', () => {

    it('should handle root index page', () => {
        const routes = [
            {filePath: '/src/app/page.tsx', type: 'page' as RouteType, segments: [], componentName: 'Home'}
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        expect(routeTree.indexPage).toBe('Home');
    });

    it('should attach loading page to layout', () => {
        const routes = [
            {filePath: '/src/app/layout.tsx', type: 'layout' as RouteType, segments: [], componentName: 'RootLayout'},
            {filePath: '/src/app/loading.tsx', type: 'loading' as RouteType, segments: [], componentName: 'RootLoading'}
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });
        expect(routeTree.layout).toBe('RootLayout');
        expect(routeTree.loading).toBe('RootLoading');
    });


    it('should ignore group folders in path segments', () => {
        const routes = [
            {
                filePath: '/src/app/(group)/about/page.tsx',
                type: 'page' as RouteType,
                segments: ['(group)', 'about'],
                componentName: 'About'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });
        expect(routeTree.children.has('(group)')).toBe(false);
        expect(routeTree.children.has('about')).toBe(true);
        expect(routeTree.children.get('about')!.indexPage).toBe('About');
    });

    it('should attach loading in nested layout', () => {
        const routes = [
            {
                filePath: '/src/app/dashboard/layout.tsx',
                type: 'layout' as RouteType,
                segments: ['dashboard'],
                componentName: 'DashboardLayout'
            },
            {
                filePath: '/src/app/dashboard/loading.tsx',
                type: 'loading' as RouteType,
                segments: ['dashboard'],
                componentName: 'DashboardLoading'
            },
            {
                filePath: '/src/app/dashboard/page.tsx',
                type: 'page' as RouteType,
                segments: ['dashboard'],
                componentName: 'DashboardPage'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        const dashboardNode = routeTree.children.get('dashboard')!;
        expect(dashboardNode.layout).toBe('DashboardLayout');
        expect(dashboardNode.loading).toBe('DashboardLoading');
        expect(dashboardNode.indexPage).toBe('DashboardPage');
    });


    it('should handle nested index page', () => {
        const routes = [
            {
                filePath: '/src/app/dashboard/page.tsx',
                type: 'page' as RouteType,
                segments: ['dashboard'],
                componentName: 'Dashboard'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        const dashboardNode = routeTree.children.get('dashboard')!;
        expect(dashboardNode.indexPage).toBe('Dashboard');
    });

    it('should handle nested layouts', () => {
        const routes = [
            {filePath: '/src/app/layout.tsx', type: 'layout' as RouteType, segments: [], componentName: 'RootLayout'},
            {
                filePath: '/src/app/dashboard/layout.tsx',
                type: 'layout' as RouteType,
                segments: ['dashboard'],
                componentName: 'DashboardLayout'
            },
            {
                filePath: '/src/app/dashboard/page.tsx',
                type: 'page' as RouteType,
                segments: ['dashboard'],
                componentName: 'Dashboard'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        expect(routeTree.layout).toBe('RootLayout');
        expect(routeTree.children.get('dashboard')!.layout).toBe('DashboardLayout');
    });

    it('should handle dynamic routes', () => {
        const routes = [
            {
                filePath: '/src/app/blog/[id].tsx',
                type: 'page' as RouteType,
                segments: ['blog', '[id]'],
                componentName: 'BlogPost'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });
        const blogNode = routeTree.children.get('blog')!;
        const dynamicNode = blogNode.children.get(':id')!;
        expect(dynamicNode.component).toBe('BlogPost');
    });

    it('should handle dynamic routes with multiple params', () => {
        const routes = [
            {
                filePath: '/src/app/dashboard/[userId]/settings/[tab].tsx',
                componentName: 'UserSettings',
                type: 'page' as RouteType,
                segments: ['dashboard', '[userId]', 'settings', '[tab]'],
            },
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
        });

        const dashboardNode = routeTree.children.get('dashboard')!;
        expect(dashboardNode).toBeDefined();

        const userNode = dashboardNode.children.get(':userId')!;
        expect(userNode).toBeDefined();

        const settingsNode = userNode.children.get('settings')!;
        expect(settingsNode).toBeDefined();

        const tabNode = settingsNode.children.get(':tab')!;
        expect(tabNode).toBeDefined();
        expect(tabNode.component).toBe('UserSettings');
    });


    it('should handle optional catch-all routes', () => {
        const routes = [
            {
                filePath: '/src/app/blog/[[...slug]].tsx',
                type: 'page' as RouteType,
                segments: ['blog', '[[...slug]]'],
                componentName: 'BlogCatchAll'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        const blogNode = routeTree.children.get('blog')!;
        const catchNode = blogNode.children.get(':slug*?')!;
        expect(catchNode.component).toBe('BlogCatchAll');
    });

    it('should handle nested dynamic and catch-all routes', () => {
        const routes = [
            // /blog/[category]/[id].tsx
            {
                filePath: '/src/app/blog/[category]/[id].tsx',
                type: 'page' as RouteType,
                segments: ['blog', '[category]', '[id]'],
                componentName: 'BlogCategoryPage'
            },

            // /blog/[category]/[...slug].tsx
            {
                filePath: '/src/app/blog/[category]/[...slug].tsx',
                type: 'page' as RouteType,
                segments: ['blog', '[category]', '[...slug]'],
                componentName: 'BlogCategoryCatchAll'
            },

            // /shop/[[...slug]].tsx
            {
                filePath: '/src/app/shop/[[...slug]].tsx',
                type: 'page' as RouteType,
                segments: ['shop', '[[...slug]]'],
                componentName: 'ShopCatchAll'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        // blog/[category]/[id]
        const blogNode = routeTree.children.get('blog')!;
        const categoryNode = blogNode.children.get(':category')!;
        const idNode = categoryNode.children.get(':id')!;
        expect(idNode.component).toBe('BlogCategoryPage');

        // blog/[category]/[...slug]
        const catchNode = categoryNode.children.get(':slug*')!;
        expect(catchNode.component).toBe('BlogCategoryCatchAll');

        // shop/[[...slug]]
        const shopNode = routeTree.children.get('shop')!;
        const shopCatch = shopNode.children.get(':slug*?')!;
        expect(shopCatch.component).toBe('ShopCatchAll');
    });

    it('should handle deeply nested dynamic segments', () => {
        const routes = [
            {
                filePath: '/src/app/products/[productId]/[category]/[variantId]/[quality]/[qualityId].tsx',
                type: 'page' as RouteType,
                segments: ['products', '[productId]', '[category]', '[variantId]', '[quality]', '[qualityId]'],
                componentName: 'ProductDetailPage'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
        });

        const productsNode = routeTree.children.get('products')!;
        const productIdNode = productsNode.children.get(':productId')!;
        const categoryNode = productIdNode.children.get(':category')!;
        const variantNode = categoryNode.children.get(':variantId')!;
        const qualityNode = variantNode.children.get(':quality')!;
        const qualityIdNode = qualityNode.children.get(':qualityId')!;

        expect(qualityIdNode.component).toBe('ProductDetailPage');
    });

    it('should handle deep nested catch-all routes', () => {
        const routes = [
            {
                filePath: '/src/app/blog/[id]/[...slug].tsx',
                type: 'page' as RouteType,
                segments: ['blog', '[id]', '[...slug]'],
                componentName: 'BlogDeepCatchAll'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        const blogNode = routeTree.children.get('blog')!;
        const idNode = blogNode.children.get(':id')!;
        const slugNode = idNode.children.get(':slug*')!;

        const match = matchPath('/blog/123/red/22/dd/22/rr/rr/1', routeTree);
        expect(match?.component).toBe('BlogDeepCatchAll');

        const params = match?.params ?? {};
        expect(params.id).toBe('123');
        expect(params.slug).toEqual(['red', '22', 'dd', '22', 'rr', 'rr', '1']);
    });

    it('should handle error pages', () => {
        const routes = [
            {filePath: '/src/app/error.tsx', type: 'error' as RouteType, segments: [], componentName: 'RootError'},
            {
                filePath: '/src/app/dashboard/error.tsx',
                type: 'error' as RouteType,
                segments: ['dashboard'],
                componentName: 'DashboardError'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        expect(routeTree.error).toBe('RootError');
        expect(routeTree.children.get('dashboard')!.error).toBe('DashboardError');
    });

    it('should handle deep nesting', () => {
        const routes = [
            {
                filePath: '/src/app/a/b/c/d/page.tsx',
                type: 'page' as RouteType,
                segments: ['a', 'b', 'c', 'd'],
                componentName: 'DeepPage'
            }
        ];

        const routeTreeBuilder = new RouteTreeBuilder();
        const routeTree = routeTreeBuilder.build(routes, {
            strict: true,
            dynamicSegmentTransform: (segment) => `:${segment.toLowerCase()}`
        });

        const deepNode = routeTree.children.get('a')!.children.get('b')!.children.get('c')!.children.get('d')!;
        expect(deepNode.indexPage).toBe('DeepPage');
    });

});
