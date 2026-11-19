import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import { ResourceDetails } from '@/components/resource/resource-details';
import { index, show } from '@/routes/activity-logs';

type ActivityLogDetail = {
    id: string;
    event: string | null;
    description: string | null;
    subject_type: string | null;
    subject_id: number | null;
    causer: string | null;
    causer_id: number | null;
    ip_address: string | null;
    changes: {
        attributes?: Record<string, unknown>;
        old?: Record<string, unknown>;
    };
    created_at: string;
};

type Props = {
    log: ActivityLogDetail;
};

function formatValue(value: unknown): string {
    if (value === '') {
        return '(empty)';
    }

    return typeof value === 'string' ? value : JSON.stringify(value);
}

function ChangeDiff({
    previous,
    current,
}: {
    previous: { exists: boolean; value: unknown };
    current: { exists: boolean; value: unknown };
}) {
    return (
        <div className="space-y-1 font-mono text-xs break-all whitespace-pre-wrap">
            {previous.exists && (
                <div className="rounded-md bg-red-50 px-2 py-1 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                    <span className="select-none">− </span>
                    {formatValue(previous.value)}
                </div>
            )}
            {current.exists && (
                <div className="rounded-md bg-green-50 px-2 py-1 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <span className="select-none">+ </span>
                    {formatValue(current.value)}
                </div>
            )}
        </div>
    );
}

export default function Show({ log }: Props) {
    const previousValues = log.changes.old ?? {};
    const currentValues = log.changes.attributes ?? {};
    const changedNames = [
        ...new Set([
            ...Object.keys(previousValues),
            ...Object.keys(currentValues),
        ]),
    ];

    const changeItems = changedNames.map((name) => ({
        label: name,
        value: (
            <ChangeDiff
                previous={{
                    exists: name in previousValues,
                    value: previousValues[name],
                }}
                current={{
                    exists: name in currentValues,
                    value: currentValues[name],
                }}
            />
        ),
    }));

    return (
        <>
            <Head title={`Activity ${log.event ?? ''}`} />

            <div className="space-y-6">
                <ResourceDetails
                    items={[
                        { label: 'Date', value: log.created_at },
                        { label: 'Event', value: log.event ?? '—' },
                        { label: 'Model', value: log.subject_type ?? '—' },
                        { label: 'Model ID', value: log.subject_id ?? '—' },
                        { label: 'User', value: log.causer ?? '—' },
                        { label: 'IP address', value: log.ip_address ?? '—' },
                    ]}
                />

                <ResourceDetails
                    title="Changes"
                    items={
                        changeItems.length > 0
                            ? changeItems
                            : [
                                  {
                                      label: 'Attributes',
                                      value: 'No attribute changes recorded.',
                                  },
                              ]
                    }
                />
            </div>
        </>
    );
}

Show.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Activity log',
            href: index.url(),
            icon: <History />,
        },
        {
            title: page.log.event ?? 'Activity',
            href: show.url(page.log.id),
        },
    ],
});
