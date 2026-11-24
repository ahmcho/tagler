import { describe, expect, it } from 'vitest';
import type { MediaFolder } from '../types';
import { childFolders, folderPath, formatBytes, quotaPercent } from './format';

const folders: MediaFolder[] = [
    {
        id: 1,
        name: 'Products',
        parent_id: null,
        created_at: null,
        files_count: 0,
        bytes: 0,
    },
    {
        id: 2,
        name: 'Shoes',
        parent_id: 1,
        created_at: null,
        files_count: 0,
        bytes: 0,
    },
    {
        id: 3,
        name: 'Blog',
        parent_id: null,
        created_at: null,
        files_count: 0,
        bytes: 0,
    },
    {
        id: 4,
        name: 'Summer',
        parent_id: 2,
        created_at: null,
        files_count: 0,
        bytes: 0,
    },
];

describe('formatBytes', () => {
    it('keeps bytes as they are and scales larger sizes', () => {
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(1536)).toBe('1.50 KB');
        expect(formatBytes(245 * 1024 * 1024)).toBe('245 MB');
    });
});

describe('folderPath', () => {
    it('lists ancestors from the top level down to the folder', () => {
        expect(folderPath(folders, 4).map((folder) => folder.name)).toEqual([
            'Products',
            'Shoes',
            'Summer',
        ]);
    });

    it('is empty at the root and for unknown folders', () => {
        expect(folderPath(folders, 'root')).toEqual([]);
        expect(folderPath(folders, 999)).toEqual([]);
    });
});

describe('childFolders', () => {
    it('returns the top-level folders sorted by name', () => {
        expect(
            childFolders(folders, 'root').map((folder) => folder.name),
        ).toEqual(['Blog', 'Products']);
    });

    it('returns the direct children of a folder', () => {
        expect(childFolders(folders, 1).map((folder) => folder.name)).toEqual([
            'Shoes',
        ]);
    });
});

describe('quotaPercent', () => {
    it('returns null without a quota and caps the value at 100', () => {
        expect(quotaPercent(10, null)).toBeNull();
        expect(quotaPercent(250, 100)).toBe(100);
        expect(quotaPercent(17, 100)).toBe(17);
    });
});
