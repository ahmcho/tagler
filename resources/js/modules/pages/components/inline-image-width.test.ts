import { describe, expect, it } from 'vitest';

import {
    maxWidthForPosition,
    normalizeImageWidth,
    readImageWidth,
    widthFromDrag,
} from './inline-image-width';

describe('image width', () => {
    it('reads a missing or blank stored width as 100', () => {
        expect(readImageWidth(null)).toBe(100);
        expect(readImageWidth('')).toBe(100);
        expect(readImageWidth('  ')).toBe(100);
    });

    it('reads a stored width and keeps it in range', () => {
        expect(readImageWidth('50')).toBe(50);
        expect(normalizeImageWidth(0)).toBe(1);
        expect(normalizeImageWidth(250)).toBe(100);
    });

    it('caps floated images at 50 percent and full-width images at 100', () => {
        expect(maxWidthForPosition('left')).toBe(50);
        expect(maxWidthForPosition('right')).toBe(50);
        expect(maxWidthForPosition('full')).toBe(100);
    });

    it('turns a drag distance into a width, clamped to the maximum', () => {
        // 278 px parent: 139 px is 50 percent of it.
        expect(widthFromDrag(25, 69.5, 278, 100)).toBe(50);
        expect(widthFromDrag(25, 500, 278, 50)).toBe(50);
        expect(widthFromDrag(25, -500, 278, 50)).toBe(1);
    });
});
