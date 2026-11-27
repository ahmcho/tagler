import { ExternalLink, Folder } from 'lucide-react';
import { RowActionsMenu } from '@/components/data-table-menu';
import type { DataTableRowAction } from '@/components/data-table-types';
import { formatBytes } from '../lib/format';
import type { MediaFolder } from '../types';
import { MediaSkeletonBar } from './media-skeleton-bar';

const SKELETON_CARD_COUNT = 4;

type Props = {
    folders: MediaFolder[];
    loading: boolean;
    onOpen: (folder: MediaFolder) => void;
};

/**
 * Folder cards for the dashboard. Opening a folder opens the library at that folder.
 */
export function MediaFolderGrid({ folders, loading, onOpen }: Props) {
    if (loading) {
        return <MediaFolderGridSkeleton />;
    }

    if (folders.length === 0) {
        return <p className="text-sm text-text-100">No folders yet.</p>;
    }

    return (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {folders.map((folder) => (
                <li
                    key={folder.id}
                    className="relative flex min-h-46 flex-col justify-between rounded-2xl border border-base-100/60 bg-background-soft-50 p-6"
                >
                    <button
                        type="button"
                        onClick={() => onOpen(folder)}
                        className="block rounded-lg text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                    >
                        <Folder
                            className="size-10 fill-amber-400 text-amber-500"
                            aria-hidden
                        />
                        <span className="mt-6 block truncate text-sm font-medium text-title-50">
                            {folder.name}
                        </span>
                    </button>
                    <span className="mt-4 flex items-center justify-between text-sm text-text-100">
                        <span>
                            {folder.files_count}{' '}
                            {folder.files_count === 1 ? 'File' : 'Files'}
                        </span>
                        <span>{formatBytes(folder.bytes)}</span>
                    </span>

                    <div className="absolute top-4 right-4">
                        <RowActionsMenu
                            row={folder}
                            rowId={folder.id}
                            rowActions={(row) => folderRowActions(row, onOpen)}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Placeholder folder cards in the same grid as the loaded cards. */
export function MediaFolderGridSkeleton() {
    return (
        <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            aria-busy="true"
            aria-label="Loading folders"
        >
            {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                <li
                    key={index}
                    className="flex min-h-46 flex-col justify-between rounded-2xl border border-base-100/60 bg-background-soft-50 p-6"
                >
                    <div>
                        <Folder
                            className="size-10 animate-pulse fill-amber-200 text-amber-300 dark:fill-amber-900 dark:text-amber-800"
                            aria-hidden
                        />
                        <MediaSkeletonBar className="mt-6 h-4 w-2/3" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <MediaSkeletonBar className="w-20" />
                        <MediaSkeletonBar className="w-14" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Row actions for a folder card, shared with the data table menu. */
function folderRowActions(
    folder: MediaFolder,
    onOpen: (folder: MediaFolder) => void,
): DataTableRowAction[] {
    return [
        {
            key: 'open-in-library',
            label: 'Open in library',
            icon: <ExternalLink className="size-4" />,
            tone: 'primary',
            onAction: () => onOpen(folder),
        },
    ];
}
