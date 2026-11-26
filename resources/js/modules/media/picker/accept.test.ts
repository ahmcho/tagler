import { describe, expect, it } from 'vitest';
import { matchesAccept, parseAccept } from './accept';

describe('parseAccept', () => {
    it('splits a comma list and trims each pattern', () => {
        expect(parseAccept(' image/* , application/pdf ')).toEqual([
            'image/*',
            'application/pdf',
        ]);
    });

    it('returns no patterns when accept is missing', () => {
        expect(parseAccept(undefined)).toEqual([]);
    });
});

describe('matchesAccept', () => {
    it('accepts every type when no pattern is given', () => {
        expect(matchesAccept('application/zip', [])).toBe(true);
    });

    it('matches a wildcard pattern by its type prefix', () => {
        expect(matchesAccept('image/webp', ['image/*'])).toBe(true);
        expect(matchesAccept('video/mp4', ['image/*'])).toBe(false);
    });

    it('matches an exact MIME type', () => {
        expect(matchesAccept('application/pdf', ['application/pdf'])).toBe(
            true,
        );
        expect(matchesAccept('application/msword', ['application/pdf'])).toBe(
            false,
        );
    });
});
