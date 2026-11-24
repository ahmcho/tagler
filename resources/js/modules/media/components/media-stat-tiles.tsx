import {
    File,
    FileAudio,
    FileText,
    Image,
    LayoutGrid,
    Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

const ALL_TONE = 'bg-brand-500/8 text-brand-500';

type Props = {
    usage: MediaUsage | null;
};

/**
 * Informational tiles, one per category plus the total. They do not filter anything.
 */
export function MediaStatTiles({ usage }: Props) {
    const totalBytes = usage?.bytes ?? 0;
    const totalFiles = usage?.files ?? 0;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <StatTile
                label="All media"
                icon={LayoutGrid}
                chipClass={ALL_TONE}
                files={totalFiles}
                bytes={totalBytes}
                percent={100}
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
};

function StatTile({
    label,
    icon: Icon,
    chipClass,
    files,
    bytes,
    percent,
}: TileProps) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-base-100/60 bg-card-background-50 p-4 pr-5">
            <div className="flex min-w-0 items-center gap-4">
                <span
                    className={`flex size-13 shrink-0 items-center justify-center rounded-xl ${chipClass}`}
                >
                    <Icon className="size-6" />
                </span>
                <div className="min-w-0">
                    <p className="mb-1 truncate text-sm font-medium text-title-50">
                        {label}
                    </p>
                    <p className="text-sm text-text-100">{percent}% Used</p>
                </div>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-text-50">
                    {files} {files === 1 ? 'File' : 'Files'}
                </p>
                <p className="text-sm text-text-100">{formatBytes(bytes)}</p>
            </div>
        </div>
    );
}
