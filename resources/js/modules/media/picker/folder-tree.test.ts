import { describe, expect, it } from 'vitest';
import type { MediaFolder } from '../types';
import { childFolders, folderTrail } from './folder-tree';

const folder = (
    id: number,
    name: string,
    parent_id: number | null,
): MediaFolder => ({
    id,
    name,
    parent_id,
    created_at: null,
    files_count: 0,
    bytes: 0,
});

const folders = [
    folder(1, 'Blog', null),
    folder(2, 'Featured', 1),
    folder(3, 'Archive', 1),
    folder(4, 'Products', null),
];

describe('childFolders', () => {
    it('lists the top-level folders sorted by name', () => {
        expect(childFolders(folders, null).map((item) => item.name)).toEqual([
            'Blog',
            'Products',
        ]);
    });

    it('lists the children of one folder sorted by name', () => {
        expect(childFolders(folders, 1).map((item) => item.name)).toEqual([
            'Archive',
            'Featured',
        ]);
    });
});

describe('folderTrail', () => {
    it('returns the path from the top level to the folder', () => {
        expect(folderTrail(folders, 2).map((item) => item.name)).toEqual([
            'Blog',
            'Featured',
        ]);
    });

    it('returns nothing for the root', () => {
        expect(folderTrail(folders, null)).toEqual([]);
    });

    it('stops when folders reference each other in a loop', () => {
        const looped = [folder(1, 'A', 2), folder(2, 'B', 1)];

        expect(folderTrail(looped, 1).length).toBeLessThanOrEqual(
            looped.length + 1,
        );
    });
});
