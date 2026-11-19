import type { ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';

export type ResourceDetailItem = {
    label: string;
    value: ReactNode;
};

export type ResourceDetailsProps = {
    title: string;
    items: ResourceDetailItem[];
};

/**
 * A read-only vertical list of label and value pairs for show pages. Use it
 * for single records. Use `DataTable` for rows of records.
 */
export function ResourceDetails({ title, items }: ResourceDetailsProps) {
    return (
        <Card className="border border-base-200 bg-white dark:border-gray-800 dark:bg-white/3">
            <CardHeader className="px-6 pt-6">
                <CardTitle className="text-lg tracking-normal md:text-lg dark:text-white/90">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-6 pt-2 pb-6">
                <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className="flex items-start gap-5 py-2.5 first:pt-0 last:pb-0"
                        >
                            <dt className="w-1/2 text-sm text-text-100 sm:w-1/3">
                                {item.label}
                            </dt>
                            <dd className="w-1/2 text-sm text-text-50 sm:w-2/3">
                                {item.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}
