import { describe, expect, it } from 'vitest';
import { parseLinkLifetime } from './link-lifetime';

describe('parseLinkLifetime', () => {
    it('treats an empty input as the global setting', () => {
        expect(parseLinkLifetime('  ')).toEqual({ ok: true, value: null });
    });

    it('accepts a whole number of minutes', () => {
        expect(parseLinkLifetime(' 30 ')).toEqual({ ok: true, value: 30 });
    });

    it('rejects zero, which is below the minimum of 1', () => {
        expect(parseLinkLifetime('0').ok).toBe(false);
    });

    it('rejects anything that is not digits only', () => {
        expect(parseLinkLifetime('1.5').ok).toBe(false);
        expect(parseLinkLifetime('-3').ok).toBe(false);
        expect(parseLinkLifetime('abc').ok).toBe(false);
    });
});
