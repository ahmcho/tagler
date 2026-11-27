import {
    Eye,
    File,
    FileAudio,
    FileImage,
    FileText,
    FileVideo,
} from 'lucide-react';
import { RowActionsMenu } from '@/components/data-table-menu';
import { Badge } from '@/components/tailgrids/core/badge';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { useDateFormat } from '@/hooks/use-date-format';
import { formatBytes, MEDIA_CATEGORIES } from '../lib/format';
import type { MediaCategory, MediaRecord } from '../types';
import { MediaSkeletonBar } from './media-skeleton-bar';

export const CATEGORY_ICONS: Record<MediaCategory, typeof File> = {
    pictures: FileImage,
    videos: FileVideo,
    audio: FileAudio,
    documents: FileText,
    other: File,
};

export const CATEGORY_LABEL = Object.fromEntries(
    MEDIA_CATEGORIES.map((category) => [category.value, category.label]),
) as Record<MediaCategory, string>;

type Props = {
    files: MediaRecord[];
    onOpen: (file: MediaRecord) => void;
};

/**
 * File rows for the dashboard's Recent Files table. A row opens the details sheet.
 */
export function MediaFileTable({ files, onOpen }: Props) {
    const { formatDate } = useDateFormat();

    return (
        <TableRoot fullBleed>
            <MediaFileTableHeader />
            <TableBody>
                {files.map((file) => {
                    const Icon = CATEGORY_ICONS[file.category];

                    return (
                        <TableRow key={file.id}>
                            <TableCell className="py-3 pl-6">
                                <button
                                    type="button"
                                    onClick={() => onOpen(file)}
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
                                            <Icon className="size-5 text-text-100" />
                                        )}
                                    </span>
                                    <span className="max-w-[260px] truncate text-sm font-medium text-title-50">
                                        {file.name}
                                    </span>
                                    {file.processing_status !== 'ready' && (
                                        <Badge
                                            color={
                                                file.processing_status ===
                                                'failed'
                                                    ? 'error'
                                                    : 'warning'
                                            }
                                        >
                                            {file.processing_status}
                                        </Badge>
                                    )}
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
                                <RowActionsMenu
                                    row={file}
                                    rowId={file.id}
                                    rowActions={() => [
                                        {
                                            key: 'details',
                                            label: 'Details',
                                            icon: <Eye className="size-4" />,
                                            tone: 'primary',
                                            onAction: () => onOpen(file),
                                        },
                                    ]}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </TableRoot>
    );
}

/** Placeholder rows in the same table as the loaded rows, with the real column headers. */
export function MediaFileTableSkeleton({ rows }: { rows: number }) {
    return (
        <TableRoot fullBleed aria-busy="true" aria-label="Loading recent files">
            <MediaFileTableHeader />
            <TableBody>
                {Array.from({ length: rows }, (_, index) => (
                    <TableRow key={index}>
                        <TableCell className="py-3 pl-6">
                            <div className="flex items-center gap-3">
                                <div className="size-7 shrink-0 animate-pulse rounded-lg bg-background-soft-400" />
                                <MediaSkeletonBar className="w-48" />
                            </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                            <MediaSkeletonBar className="w-20" />
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

function MediaFileTableHeader() {
    return (
        <TableHeader>
            <TableRow>
                <TableHead className="h-11 px-4 py-3 text-text-100 first:pl-6">
                    File Name
                </TableHead>
                <TableHead className="h-11 px-4 py-3 text-text-100 first:pl-6">
                    Category
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
