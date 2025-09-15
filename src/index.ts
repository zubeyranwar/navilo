export { navilo } from './plugin';

export type {
    RouteFile,
    RouteType,
    RouteNode,
    ParserOptions
} from './types';

export {
    normalizeFilePath,
    getRouteType,
    getComponentName,
    findRouteFiles
} from './generator/createRoutes';

export { SegmentParser } from './generator/parser/segmentParser';
export { RouteTreeBuilder } from './generator/parser/routeTreeBuilder';
export { RouteDefinitionGenerator } from './generator/parser/routeDefinitionGenerator';