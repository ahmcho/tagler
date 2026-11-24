import { MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import {
    CATEGORY_TONE,
    formatBytes,
    MEDIA_CATEGORIES,
    quotaPercent,
} from '../lib/format';
import type { MediaUsage } from '../types';

const RADIUS = 80;
const STROKE = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
    usage: MediaUsage | null;
    onRefresh: () => void;
};

/**
 * Donut of used space by category, with a legend. Without a quota the subtitle shows no free space.
 */
export function MediaStorageDonut({ usage, onRefresh }: Props) {
    const used = usage?.bytes ?? 0;
    const quota = usage?.quota_bytes ?? null;
    const percent = quotaPercent(used, quota);

    const lengths = MEDIA_CATEGORIES.map((category) => {
        const bytes = usage?.categories[category.value]?.bytes ?? 0;

        return used > 0 ? (bytes / used) * CIRCUMFERENCE : 0;
    });
    const segments = MEDIA_CATEGORIES.map((category, index) => ({
        category,
        bytes: usage?.categories[category.value]?.bytes ?? 0,
        length: lengths[index],
        offset: lengths
            .slice(0, index)
            .reduce((sum, length) => sum + length, 0),
    }));

    return (
        <div className="flex h-full flex-col rounded-2xl border border-base-200 bg-card-background-50">
            <div className="flex items-start justify-between gap-3 p-6">
                <div>
                    <h3 className="text-lg font-semibold text-title-50">
                        Storage Details
                    </h3>
                    <p className="mt-1 text-sm text-text-100">
                        {quota
                            ? `${formatBytes(Math.max(quota - used, 0))} Free space left`
                            : 'No storage quota set'}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label="Storage actions"
                        className="flex size-10 items-center justify-center rounded-[10px] text-text-100 hover:bg-background-soft-50"
                    >
                        <MoreHorizontal className="size-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onAction={onRefresh}>
                            Refresh
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex flex-1 flex-col gap-6 px-6 pb-6">
                <div className="relative mx-auto aspect-square w-full max-w-[220px]">
                    <svg
                        viewBox="0 0 200 200"
                        className="size-full -rotate-90"
                        role="img"
                        aria-label="Used space by category"
                    >
                        <circle
                            cx="100"
                            cy="100"
                            r={RADIUS}
                            fill="none"
                            strokeWidth={STROKE}
                            className="stroke-base-200"
                        />
                        {segments.map((segment) =>
                            segment.length > 0 ? (
                                <circle
                                    key={segment.category.value}
                                    cx="100"
                                    cy="100"
                                    r={RADIUS}
                                    fill="none"
                                    strokeWidth={STROKE}
                                    stroke={
                                        CATEGORY_TONE[segment.category.value]
                                            .hex
                                    }
                                    strokeDasharray={`${segment.length} ${CIRCUMFERENCE}`}
                                    strokeDashoffset={-segment.offset}
                                >
                                    <title>{`${segment.category.label}: ${formatBytes(segment.bytes)}`}</title>
                                </circle>
                            ) : null,
                        )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-black dark:text-white">
                            {formatBytes(used)}
                        </span>
                        <span className="text-xs text-text-100">
                            {quota
                                ? `Used of ${formatBytes(quota)}${percent !== null ? ` (${percent}%)` : ''}`
                                : 'Used'}
                        </span>
                    </div>
                </div>

                <ul className="flex flex-col gap-4">
                    {segments.map((segment) => (
                        <li
                            key={segment.category.value}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="flex items-center gap-1.5 text-text-50">
                                <span
                                    className="size-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            CATEGORY_TONE[
                                                segment.category.value
                                            ].hex,
                                    }}
                                    aria-hidden
                                />
                                {segment.category.label}
                            </span>
                            <span className="text-text-100">
                                {formatBytes(segment.bytes)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
