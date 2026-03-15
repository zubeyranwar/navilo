import {ParserOptions} from "../../types";

export class SegmentParser {
    private static readonly SEGMENT_PATTERNS = {
        OPTIONAL_CATCH_ALL: /^\[\[\.{3}(.+)\]\]$/,
        CATCH_ALL: /^\[\.{3}(.+)\]$/,
        DYNAMIC: /^\[(.+)\]$/,
        GROUP: /^\((.+)\)$/
    };

    static normalize(segment: string, options?: ParserOptions): string | null {
        if (this.isGroupSegment(segment)) return null;

        if (segment.includes('/')) {
            return segment.split('/')
                .map(seg => this.normalizeSegment(seg, options))
                .filter(Boolean)
                .join('/');
        }

        return this.normalizeSegment(segment, options);
    }

    private static normalizeSegment(segment: string, options?: ParserOptions): string | null {
        const transform = options?.dynamicSegmentTransform || this.defaultTransform;

        if (this.isOptionalCatchAll(segment)) {
            const name = segment.match(this.SEGMENT_PATTERNS.OPTIONAL_CATCH_ALL)![1];
            return transform(`${name}*?`);
        }

        if (this.isCatchAll(segment)) {
            const name = segment.match(this.SEGMENT_PATTERNS.CATCH_ALL)![1];
            return transform(`${name}*`);
        }

        if (this.isDynamicSegment(segment)) {
            const name = segment.match(this.SEGMENT_PATTERNS.DYNAMIC)![1];
            return transform(name);
        }

        return segment;
    }

    private static defaultTransform(name: string): string {
        return `:${name}`;
    }

    private static isGroupSegment(segment: string): boolean {
        return this.SEGMENT_PATTERNS.GROUP.test(segment);
    }

    private static isOptionalCatchAll(segment: string): boolean {
        return this.SEGMENT_PATTERNS.OPTIONAL_CATCH_ALL.test(segment);
    }

    private static isCatchAll(segment: string): boolean {
        return this.SEGMENT_PATTERNS.CATCH_ALL.test(segment);
    }

    private static isDynamicSegment(segment: string): boolean {
        return this.SEGMENT_PATTERNS.DYNAMIC.test(segment);
    }
}