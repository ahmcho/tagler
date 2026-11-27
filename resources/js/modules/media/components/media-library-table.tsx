import {
    Eye,
    Folder,
    FolderOpen,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';
import {
    DataTableMenuItems,
    menuContentClassName,
} from '@/components/data-table';
import type { DataTableMenuItem } from '@/components/data-table';
import { Button } from '@/components/tailgrids/core/button';
import {
    DropdownMenu,
    DropdownMenuContent,
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
import { MediaSkeletonBar } from './media-skeleton-bar';

const SKELETON_ROW_COUNT = 8;

function FileIcon({ category }: { category: keyof typeof CATEGORY_ICONS }) {
    const Icon = CATEGORY_ICONS[category];

    return <Icon className="size-5 text-text-100" />;
}

/** Row menu in the same design as the index pages: a ghost icon button and a toned menu. */
function RowActions({
    label,
    items,
}: {
    label: string;
    items: DataTableMenuItem[];
}) {
    return (
        <DropdownMenu>
            <Button aria-label={label} variant="ghost" iconOnly>
                <MoreHorizontal className="size-5" />
            </Button>
            <DropdownMenuContent
                placement="bottom end"
                className={menuContentClassName}
            >
                <DataTableMenuItems items={items} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
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
            <MediaLibraryTableHeader />
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
                        <TableCell className="py-3 pr-6 text-right">
                            <RowActions
                                label={`Actions for ${folder.name}`}
                                items={[
                                    {
                                        key: 'open',
                                        label: 'Open',
                                        icon: <FolderOpen className="size-4" />,
                                        tone: 'primary',
                                        onAction: () => onOpenFolder(folder),
                                    },
                                    ...(canManageFolders
                                        ? [
                                              {
                                                  key: 'rename',
                                                  label: 'Rename',
                                                  icon: (
                                                      <Pencil className="size-4" />
                                                  ),
                                                  tone: 'success' as const,
                                                  onAction: () =>
                                                      onRenameFolder(folder),
                                              },
                                              {
                                                  key: 'delete',
                                                  label: 'Delete',
                                                  icon: (
                                                      <Trash2 className="size-4" />
                                                  ),
                                                  tone: 'danger' as const,
                                                  onAction: () =>
                                                      onDeleteFolder(folder),
                                              },
                                          ]
                                        : []),
                                ]}
                            />
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
                        <TableCell className="py-3 pr-6 text-right">
                            <RowActions
                                label={`Actions for ${file.name}`}
                                items={[
                                    {
                                        key: 'details',
                                        label: 'Details',
                                        icon: <Eye className="size-4" />,
                                        tone: 'primary',
                                        onAction: () => onOpenFile(file),
                                    },
                                ]}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableRoot>
    );
}

/** Placeholder rows in the same table as the loaded library, with the real column headers. */
export function MediaLibraryTableSkeleton() {
    return (
        <TableRoot fullBleed aria-busy="true" aria-label="Loading library">
            <MediaLibraryTableHeader />
            <TableBody>
                {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                    <TableRow key={index}>
                        <TableCell className="py-3 pl-6">
                            <div className="flex items-center gap-3">
                                <div className="size-7 shrink-0 animate-pulse rounded-lg bg-background-soft-400" />
                                <MediaSkeletonBar className="w-56" />
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                            <MediaSkeletonBar className="w-16" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                            <MediaSkeletonBar className="w-14" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                            <MediaSkeletonBar className="w-24" />
                        </TableCell>
                        <TableCell className="py-3 pr-6 text-right">
                            <div className="ml-auto size-10 animate-pulse rounded-[10px] bg-background-soft-400" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableRoot>
    );
}

function MediaLibraryTableHeader() {
    return (
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
                <TableHead className="h-11 px-4 py-3 text-right text-text-100 last:pr-6">
                    Actions
                </TableHead>
            </TableRow>
        </TableHeader>
    );
}
