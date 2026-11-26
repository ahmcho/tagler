import {
    Check,
    FileFormatPdf,
    FileImage,
    FileText,
    FileVideo,
    Music,
} from '@tailgrids/icons';
import { GridList, GridListItem } from 'react-aria-components';
import type { Selection } from 'react-aria-components';
import { AspectRatio } from '@/components/tailgrids/core/aspect-ratio';
import { Skeleton } from '@/components/tailgrids/core/skeleton';
import { cn } from '@/utils/cn';
import { formatBytes } from '../lib/format';
import type { MediaRecord } from '../types';
import { matchesAccept } from './accept';

type Props = {
    files: MediaRecord[];
    loading: boolean;
    acceptPatterns: string[];
    selectedId: string | null;
    emptyText: string;
    onSelect: (file: MediaRecord) => void;
};

/** Responsive grid of files. Files that do not match `accept` stay visible but cannot be chosen. */
export function MediaPickerFileGrid({
    files,
    loading,
    acceptPatterns,
    selectedId,
    emptyText,
    onSelect,
}: Props) {
    if (loading && files.length === 0) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-lg border border-base-100"
                    >
                        <Skeleton className="aspect-4/3 h-auto w-full rounded-none" />
                        <div className="flex flex-col gap-2 p-3">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const disabledIds = files
        .filter((file) => !matchesAccept(file.mime_type, acceptPatterns))
        .map((file) => file.id);

    function handleSelectionChange(keys: Selection) {
        if (keys === 'all') {
            return;
        }

        const [key] = [...keys];
        const file = files.find((candidate) => candidate.id === key);

        if (file) {
            onSelect(file);
        }
    }

    return (
        <GridList
            aria-label="Files"
            layout="grid"
            items={files}
            selectionMode="single"
            selectionBehavior="replace"
            disallowEmptySelection
            selectedKeys={selectedId ? [selectedId] : []}
            disabledKeys={disabledIds}
            onSelectionChange={handleSelectionChange}
            renderEmptyState={() => (
                <div className="col-span-full flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-text-100">
                    <FileImage className="size-10 text-text-200" />
                    {emptyText}
                </div>
            )}
            className="grid grid-cols-2 gap-3 outline-none sm:grid-cols-3 lg:grid-cols-4"
        >
            {(file) => <FileTile file={file} />}
        </GridList>
    );
}

function FileTile({ file }: { file: MediaRecord }) {
    const preview =
        file.category === 'pictures' ? (file.thumbnail_url ?? file.url) : null;

    return (
        <GridListItem
            id={file.id}
            textValue={file.name}
            className={cn(
                'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-base-100 bg-background-100 transition outline-none',
                'hover:border-base-300',
                'data-focus-visible:ring-4 data-focus-visible:ring-primary-500/20',
                'data-selected:bg-primary-500/10data-selected:ring-4 data-selected:border-primary-500 data-selected:ring-primary-500/20',
                'data-disabled:cursor-not-allowed data-disabled:opacity-50',
            )}
        >
            <AspectRatio ratio="4/3" className="bg-background-soft-100">
                {preview ? (
                    <img
                        src={preview}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-text-200">
                        <FileTypeIcon file={file} />
                    </div>
                )}
            </AspectRatio>

            <span
                aria-hidden="true"
                className="absolute top-2 right-2 flex size-6 scale-75 items-center justify-center rounded-full bg-primary-500 text-white-100 opacity-0 shadow-sm transition group-data-selected:scale-100 group-data-selected:opacity-100"
            >
                <Check className="size-4" />
            </span>

            <div className="min-w-0 px-3 py-2">
                <p
                    className="truncate text-sm font-medium text-title-50"
                    title={file.name}
                >
                    {file.name}
                </p>
                <p className="text-xs text-text-100">
                    {formatBytes(file.size)}
                </p>
            </div>
        </GridListItem>
    );
}

function FileTypeIcon({ file }: { file: MediaRecord }) {
    const className = 'size-10';

    if (file.mime_type === 'application/pdf') {
        return <FileFormatPdf className={className} />;
    }

    switch (file.category) {
        case 'videos':
            return <FileVideo className={className} />;
        case 'audio':
            return <Music className={className} />;
        case 'pictures':
            return <FileImage className={className} />;
        default:
            return <FileText className={className} />;
    }
}
