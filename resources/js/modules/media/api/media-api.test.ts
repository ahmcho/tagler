import { describe, expect, it } from 'vitest';
import type { MediaLibraryQuery } from '../types';
import { libraryUrl } from './media-api';

const baseQuery: MediaLibraryQuery = {
    folder: 'root',
    search: '',
    category: null,
    sort: 'created_desc',
    trashed: false,
    page: 1,
    perPage: 20,
};

describe('libraryUrl', () => {
    it('sends the trash flag as 1, which the server accepts', () => {
        const url = new URL(
            libraryUrl({ ...baseQuery, trashed: true }),
            'http://app.test',
        );

        expect(url.searchParams.get('trashed')).toBe('1');
    });

    it('leaves the trash flag out when the trash is closed', () => {
        const url = new URL(libraryUrl(baseQuery), 'http://app.test');

        expect(url.searchParams.has('trashed')).toBe(false);
    });
});
