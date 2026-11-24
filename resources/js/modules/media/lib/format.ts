import type { MediaCategory, MediaFolder, MediaFolderFilter } from '../types';

export const MEDIA_CATEGORIES: { value: MediaCategory; label: string }[] = [
    { value: 'pictures', label: 'Pictures' },
    { value: 'videos', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'documents', label: 'Documents' },
    { value: 'other', label: 'Other' },
];

export function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes / 1024;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }

    return `${value.toFixed(value >= 10 ? 0 : 2)} ${units[unit]}`;
}

export function formatDate(iso: string | null): string {
    if (!iso) {
        return '';
    }

    return new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(iso));
}

/**
 * Path from the top level to the given folder, in order. Unknown folders give an empty path.
 */
export function folderPath(
    folders: MediaFolder[],
    folderId: MediaFolderFilter,
): MediaFolder[] {
    if (folderId === 'root') {
        return [];
    }

    const byId = new Map(folders.map((folder) => [folder.id, folder]));
    const path: MediaFolder[] = [];
    let current = byId.get(folderId);

    while (current) {
        path.unshift(current);
        current =
            current.parent_id === null
                ? undefined
                : byId.get(current.parent_id);
    }

    return path;
}

export function childFolders(
    folders: MediaFolder[],
    parent: MediaFolderFilter,
): MediaFolder[] {
    return folders
        .filter((folder) =>
            parent === 'root'
                ? folder.parent_id === null
                : folder.parent_id === parent,
        )
        .sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Share of the quota in use, as a whole percentage capped at 100. Null when there is no quota.
 */
export function quotaPercent(
    usedBytes: number,
    quotaBytes: number | null,
): number | null {
    if (!quotaBytes || quotaBytes <= 0) {
        return null;
    }

    return Math.min(100, Math.round((usedBytes / quotaBytes) * 100));
}
