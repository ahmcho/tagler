import { Folder, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { formatBytes, formatDate } from '../lib/format';
import type { MediaFolder, MediaRecord } from '../types';
import { CATEGORY_ICONS, CATEGORY_LABEL } from './media-file-table';

function FileIcon({ category }: { category: keyof typeof CATEGORY_ICONS }) {
    const Icon = CATEGORY_ICONS[category];

    return <Icon className="size-5 text-text-100" />;
}

type Props = {
    folders: MediaFolder[];
    files: MediaRecord[];
    canManageFolders: boolean;
    onOpenFolder: (folder: MediaFolder) => void;
    onRenameFolder: (folder: MediaFolder) => void;
    onDeleteFolder: (folder: MediaFolder) => void;
    onOpenFile: (file: MediaRecord) => void;
};

/**
 * The library listing: folder rows first, then file rows. Folder rows open the folder in place.
 */
export function MediaLibraryTable({
    folders,
    files,
    canManageFolders,
    onOpenFolder,
    onRenameFolder,
    onDeleteFolder,
    onOpenFile,
}: Props) {
    return (
        <TableRoot fullBleed>
            <TableHeader>
                <TableRow>
                    <TableHead className="h-11 px-4 py-3 text-text-100 first:pl-6">
                        Name
                    </TableHead>
                    <TableHead className="h-11 px-4 py-3 text-text-100 first:pl-6">
                        Type
                    </TableHead>
                    <TableHead className="h-11 px-4 py-3 text-text-100 first:pl-6">
                        Size
                    </TableHead>
                    <TableHead className="h-11 px-4 py-3 text-text-100 first:pl-6">
                        Date Modified
                    </TableHead>
                    <TableHead className="h-11 px-4 py-3 text-center text-text-100 last:pr-6">
                        Action
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {folders.map((folder) => (
                    <TableRow key={`folder-${folder.id}`}>
                        <TableCell className="py-3 pl-6">
                            <button
                                type="button"
                                onClick={() => onOpenFolder(folder)}
                                className="flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                            >
                                <Folder
                                    className="size-6 fill-amber-400 text-amber-500"
                                    aria-hidden
                                />
                                <span className="text-sm font-medium text-title-50">
                                    {folder.name}
                                </span>
                            </button>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-text-50">
                            Folder
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-text-50">
                            {formatBytes(folder.bytes)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-text-50">
                            {formatDate(folder.created_at)}
                        </TableCell>
                        <TableCell className="py-3 pr-6 text-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    aria-label={`Actions for ${folder.name}`}
                                    className="mx-auto flex size-10 items-center justify-center rounded-[10px] text-text-100 hover:bg-background-soft-50"
                                >
                                    <MoreHorizontal className="size-5" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onAction={() => onOpenFolder(folder)}
                                    >
                                        Open
                                    </DropdownMenuItem>
                                    {canManageFolders && (
                                        <DropdownMenuItem
                                            onAction={() =>
                                                onRenameFolder(folder)
                                            }
                                        >
                                            Rename
                                        </DropdownMenuItem>
                                    )}
                                    {canManageFolders && (
                                        <DropdownMenuItem
                                            onAction={() =>
                                                onDeleteFolder(folder)
                                            }
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
                {files.map((file) => (
                    <TableRow key={file.id}>
                        <TableCell className="py-3 pl-6">
                            <button
                                type="button"
                                onClick={() => onOpenFile(file)}
                                className="flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                            >
                                <span
                                    className={`flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg ${file.thumbnail_url ? 'bg-background-soft-50' : ''}`}
                                >
                                    {file.thumbnail_url ? (
                                        <img
                                            src={file.thumbnail_url}
                                            alt=""
                                            loading="lazy"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <FileIcon category={file.category} />
                                    )}
                                </span>
                                <span className="max-w-[260px] truncate text-sm font-medium text-title-50">
                                    {file.name}
                                </span>
                            </button>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-text-50">
                            {CATEGORY_LABEL[file.category]}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-text-50">
                            {formatBytes(file.size)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-text-50">
                            {formatDate(file.created_at)}
                        </TableCell>
                        <TableCell className="py-3 pr-6 text-center">
                            <button
                                type="button"
                                onClick={() => onOpenFile(file)}
                                className="mx-auto text-sm font-medium text-primary-500 hover:underline"
                            >
                                Details
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableRoot>
    );
}
