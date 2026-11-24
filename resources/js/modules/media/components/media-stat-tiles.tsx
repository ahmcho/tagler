import {
    File,
    FileAudio,
    FileText,
    Image,
    LayoutGrid,
    Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    CATEGORY_TONE,
    formatBytes,
    MEDIA_CATEGORIES,
    percentOf,
} from '../lib/format';
import type { MediaCategory, MediaUsage } from '../types';

const CATEGORY_ICONS: Record<MediaCategory, LucideIcon> = {
    pictures: Image,
    videos: Video,
    audio: FileAudio,
    documents: FileText,
    other: File,
};

type Props = {
    usage: MediaUsage | null;
    active: MediaCategory | null;
    onSelect: (category: MediaCategory | null) => void;
};

/**
 * One bordered tile per category, laid out in a grid. A tile is also the category filter.
 */
export function MediaStatTiles({ usage, active, onSelect }: Props) {
    const totalBytes = usage?.bytes ?? 0;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatTile
                label="All media"
                icon={LayoutGrid}
                chipClass="bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400"
                files={usage?.files ?? 0}
                bytes={totalBytes}
                percent={100}
                selected={active === null}
                onSelect={() => onSelect(null)}
            />
            {MEDIA_CATEGORIES.map((category) => {
                const bytes = usage?.categories[category.value]?.bytes ?? 0;

                return (
                    <StatTile
                        key={category.value}
                        label={category.label}
                        icon={CATEGORY_ICONS[category.value]}
                        chipClass={CATEGORY_TONE[category.value].chip}
                        files={usage?.categories[category.value]?.files ?? 0}
                        bytes={bytes}
                        percent={percentOf(bytes, totalBytes)}
                        selected={active === category.value}
                        onSelect={() => onSelect(category.value)}
                    />
                );
            })}
        </div>
    );
}

type TileProps = {
    label: string;
    icon: LucideIcon;
    chipClass: string;
    files: number;
    bytes: number;
    percent: number;
    selected: boolean;
    onSelect: () => void;
};

function StatTile({
    label,
    icon: Icon,
    chipClass,
    files,
    bytes,
    percent,
    selected,
    onSelect,
}: TileProps) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onSelect}
            className={cn(
                'flex w-full items-center justify-between gap-4 rounded-xl border border-base-200 p-4 text-left transition-colors hover:bg-background-soft-50 focus-visible:outline-2 focus-visible:outline-primary-500',
                selected && 'border-primary-500 bg-background-soft-50',
            )}
        >
            <span className="flex min-w-0 items-center gap-4">
                <span
                    className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-xl',
                        chipClass,
                    )}
                >
                    <Icon className="size-6" />
                </span>
                <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-title-50">
                        {label}
                    </span>
                    <span className="block text-sm text-text-100">
                        {percent}% Used
                    </span>
                </span>
            </span>
            <span className="shrink-0 text-right">
                <span className="block text-sm font-medium text-title-50">
                    {files} {files === 1 ? 'File' : 'Files'}
                </span>
                <span className="block text-sm text-text-100">
                    {formatBytes(bytes)}
                </span>
            </span>
        </button>
    );
}
