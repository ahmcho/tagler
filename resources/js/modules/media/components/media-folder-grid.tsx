import { Folder, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/tailgrids/core/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
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
        return null;
    }

    return (
        <section aria-label="Folders" className="space-y-3">
            <h2 className="text-sm font-medium text-text-50">Folders</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {folders.map((folder) => (
                    <Card key={folder.id} className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => onOpen(folder)}
                            className="flex min-w-0 flex-1 items-center gap-3 py-4 pl-4 text-left"
                        >
                            <Folder className="size-6 shrink-0 text-primary-500" />
                            <span className="truncate text-sm font-medium text-text-50">
                                {folder.name}
                            </span>
                        </button>

                        {canManage && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    aria-label={`Actions for ${folder.name}`}
                                    className="mr-3 flex size-10 shrink-0 items-center justify-center rounded-lg text-text-100 hover:bg-background-soft-50"
                                >
                                    <MoreHorizontal className="size-4" />
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
                    </Card>
                ))}
            </div>
        </section>
    );
}
