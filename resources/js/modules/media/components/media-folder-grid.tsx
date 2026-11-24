import { Folder, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import { formatBytes } from '../lib/format';
import type { MediaFolder } from '../types';

type Props = {
    folders: MediaFolder[];
    canManage: boolean;
    onOpen: (folder: MediaFolder) => void;
    onRename: (folder: MediaFolder) => void;
    onDelete: (folder: MediaFolder) => void;
};

export function MediaFolderGrid({
    folders,
    canManage,
    onOpen,
    onRename,
    onDelete,
}: Props) {
    if (folders.length === 0) {
        return <p className="text-sm text-text-100">No folders here yet.</p>;
    }

    return (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {folders.map((folder) => (
                <li
                    key={folder.id}
                    className="relative rounded-xl border border-base-200 p-4 transition-colors hover:bg-background-soft-50"
                >
                    <button
                        type="button"
                        onClick={() => onOpen(folder)}
                        className="block w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                    >
                        <Folder
                            className="size-9 fill-amber-400 text-amber-500"
                            aria-hidden
                        />
                        <span className="mt-6 block truncate text-sm font-medium text-title-50">
                            {folder.name}
                        </span>
                        <span className="mt-1 flex items-center justify-between text-xs text-text-100">
                            <span>
                                {folder.files_count}{' '}
                                {folder.files_count === 1 ? 'File' : 'Files'}
                            </span>
                            <span>{formatBytes(folder.bytes)}</span>
                        </span>
                    </button>

                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                aria-label={`Actions for ${folder.name}`}
                                className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-lg text-text-100 hover:bg-background-soft-50"
                            >
                                <MoreVertical className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onAction={() => onOpen(folder)}
                                >
                                    Open
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onAction={() => onRename(folder)}
                                >
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onAction={() => onDelete(folder)}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </li>
            ))}
        </ul>
    );
}
