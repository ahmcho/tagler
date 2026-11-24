import {
    File,
    FileAudio,
    FileImage,
    FileText,
    FileVideo,
    MoreVertical,
} from 'lucide-react';
import { Badge } from '@/components/tailgrids/core/badge';
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
import { formatBytes, formatDate, MEDIA_CATEGORIES } from '../lib/format';
import type { MediaCategory, MediaRecord } from '../types';

const CATEGORY_ICONS: Record<MediaCategory, typeof File> = {
    pictures: FileImage,
    videos: FileVideo,
    audio: FileAudio,
    documents: FileText,
    other: File,
};

const CATEGORY_LABEL = Object.fromEntries(
    MEDIA_CATEGORIES.map((category) => [category.value, category.label]),
);

type Props = {
    files: MediaRecord[];
    onOpen: (file: MediaRecord) => void;
};

/**
 * The file list in the design's "Recent Files" table. A row opens the details sheet.
 */
export function MediaFileTable({ files, onOpen }: Props) {
    return (
        <TableRoot fullBleed>
            <TableHeader>
                <TableRow>
                    <TableHead>File name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date modified</TableHead>
                    <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.map((file) => {
                    const Icon = CATEGORY_ICONS[file.category];

                    return (
                        <TableRow key={file.id}>
                            <TableCell>
                                <button
                                    type="button"
                                    onClick={() => onOpen(file)}
                                    className="flex items-center gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                                >
                                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background-soft-50">
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
                                    <span className="max-w-[280px] truncate text-sm font-medium text-title-50">
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
                            <TableCell className="text-sm text-text-100">
                                {CATEGORY_LABEL[file.category]}
                            </TableCell>
                            <TableCell className="text-sm text-text-100">
                                {formatBytes(file.size)}
                            </TableCell>
                            <TableCell className="text-sm text-text-100">
                                {formatDate(file.created_at)}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        aria-label={`Actions for ${file.name}`}
                                        className="flex size-8 items-center justify-center rounded-lg text-text-100 hover:bg-background-soft-50"
                                    >
                                        <MoreVertical className="size-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem
                                            onAction={() => onOpen(file)}
                                        >
                                            View details
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </TableRoot>
    );
}
