import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';
import {
    CATEGORY_TONE,
    formatBytes,
    MEDIA_CATEGORIES,
    quotaPercent,
} from '../lib/format';
import type { MediaUsage } from '../types';

const RADIUS = 80;
const STROKE = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
    usage: MediaUsage | null;
};

/**
 * Donut of used space by category. Without a quota the donut shows the used total only.
 */
export function MediaStorageDonut({ usage }: Props) {
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
        <Card className="h-full min-w-0 border border-base-200 md:min-w-0">
            <CardHeader className="border-b border-base-200 px-6 py-5">
                <CardTitle className="text-xl">Storage details</CardTitle>
                <p className="mt-1 text-sm text-text-100">
                    {quota
                        ? `${formatBytes(Math.max(quota - used, 0))} free space left`
                        : 'No storage quota set'}
                </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <div className="relative mx-auto aspect-square w-full max-w-[260px]">
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
                        <span className="text-2xl font-semibold text-title-50">
                            {formatBytes(used)}
                        </span>
                        <span className="text-sm text-text-100">
                            {quota
                                ? `Used of ${formatBytes(quota)}${percent !== null ? ` (${percent}%)` : ''}`
                                : 'Used'}
                        </span>
                    </div>
                </div>

                <ul className="space-y-3">
                    {segments.map((segment) => (
                        <li
                            key={segment.category.value}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="flex items-center gap-2 text-text-100">
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
                            <span className="font-medium text-title-50">
                                {formatBytes(segment.bytes)}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
