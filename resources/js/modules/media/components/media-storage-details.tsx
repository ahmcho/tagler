import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';
import { formatBytes, MEDIA_CATEGORIES, quotaPercent } from '../lib/format';
import type { MediaUsage } from '../types';

const SEGMENT_CLASSES: Record<string, string> = {
    pictures: 'bg-primary-500',
    videos: 'bg-success-500',
    audio: 'bg-warning-500',
    documents: 'bg-blue-light-500',
    other: 'bg-gray-400',
};

/**
 * Used space, with one segment per category. The quota figures appear only when a quota is set.
 */
export function MediaStorageDetails({ usage }: { usage: MediaUsage | null }) {
    const used = usage?.bytes ?? 0;
    const percent = quotaPercent(used, usage?.quota_bytes ?? null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Storage details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-text-100">
                    {formatBytes(used)}
                    {usage?.quota_bytes
                        ? ` used of ${formatBytes(usage.quota_bytes)} (${percent}%)`
                        : ' used'}
                </p>

                <div className="bg-base-200 flex h-3 w-full overflow-hidden rounded-full">
                    {MEDIA_CATEGORIES.map((category) => {
                        const bytes =
                            usage?.categories[category.value]?.bytes ?? 0;
                        const width = used > 0 ? (bytes / used) * 100 : 0;

                        return (
                            <div
                                key={category.value}
                                className={SEGMENT_CLASSES[category.value]}
                                style={{ width: `${width}%` }}
                                title={`${category.label}: ${formatBytes(bytes)}`}
                            />
                        );
                    })}
                </div>

                <ul className="grid grid-cols-2 gap-2 text-sm text-text-100 md:grid-cols-5">
                    {MEDIA_CATEGORIES.map((category) => (
                        <li
                            key={category.value}
                            className="flex items-center gap-2"
                        >
                            <span
                                className={`size-2.5 rounded-full ${SEGMENT_CLASSES[category.value]}`}
                                aria-hidden
                            />
                            {category.label}:{' '}
                            {formatBytes(
                                usage?.categories[category.value]?.bytes ?? 0,
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
