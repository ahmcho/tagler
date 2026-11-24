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
    if (folderId === 'root' || folderId === 'all') {
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

/** Tint and chart colour for each category. The hex value is used by the SVG chart. */
export const CATEGORY_TONE: Record<
    MediaCategory,
    { chip: string; text: string; hex: string }
> = {
    pictures: {
        chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
        text: 'text-emerald-600 dark:text-emerald-400',
        hex: '#12b76a',
    },
    videos: {
        chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
        text: 'text-sky-600 dark:text-sky-400',
        hex: '#0ba5ec',
    },
    audio: {
        chip: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
        text: 'text-blue-600 dark:text-blue-400',
        hex: '#2e90fa',
    },
    documents: {
        chip: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
        text: 'text-orange-600 dark:text-orange-400',
        hex: '#fb6514',
    },
    other: {
        chip: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
        text: 'text-violet-600 dark:text-violet-400',
        hex: '#7a5af8',
    },
};

/** Whole percentage of `part` in `whole`. Zero when the whole is zero. */
export function percentOf(part: number, whole: number): number {
    if (whole <= 0) {
        return 0;
    }

    return Math.round((part / whole) * 100);
}
