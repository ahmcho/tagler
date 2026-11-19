import { router } from '@inertiajs/react';
import { Eye, History } from 'lucide-react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
import { index, show } from '@/routes/activity-logs';

type ActivityLogRecord = {
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

type Filters = {
    event?: string;
    subject_type?: string;
    subject_id?: number;
    causer_id?: number;
    sort?: string;
    direction?: 'asc' | 'desc';
};

type Props = {
    records: {
        data: ActivityLogRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: Filters;
};

const EVENTS = ['created', 'updated', 'deleted'];

const columns: DataTableColumn<ActivityLogRecord>[] = [
    {
        key: 'created_at',
        header: 'Date',
        cell: (log) => log.created_at,
        sortable: true,
    },
    { key: 'event', header: 'Event', accessor: 'event', sortable: true },
    {
        key: 'subject_type',
        header: 'Model',
        accessor: 'subject_type',
        sortable: true,
    },
    { key: 'subject_id', header: 'Model ID', accessor: 'subject_id' },
    { key: 'causer', header: 'User', accessor: 'causer' },
    { key: 'ip_address', header: 'IP address', accessor: 'ip_address' },
    {
        key: 'changes',
        header: 'Changes',
        cell: (log) => {
            const attributes = Object.entries(log.changes.attributes ?? {});

            if (attributes.length === 0) {
                return '—';
            }

            return attributes
                .map(([name, value]) => {
                    const previous = log.changes.old?.[name];

                    return previous === undefined
                        ? `${name}: ${String(value)}`
                        : `${name}: ${String(previous)} → ${String(value)}`;
                })
                .join('; ');
        },
    },
];

export default function Index({ records, filters }: Props) {
    return (
        <ResourcePage title="Activity log">
            <ResourceIndexContent<ActivityLogRecord>
                caption="Activity log"
                indexUrl={index.url()}
                dataKey="records"
                query={filters}
                defaultSortDirection="desc"
                pagination={{
                    currentPage: records.current_page,
                    lastPage: records.last_page,
                    total: records.total,
                }}
                rows={records.data}
                columns={columns}
                getRowId={(log) => log.id}
                rowActions={(log) => [
                    {
                        key: 'view',
                        label: 'View',
                        icon: <Eye className="size-4" />,
                        tone: 'primary' as const,
                        onAction: () => router.visit(show.url(log.id)),
                    },
                ]}
                emptyState="No activity found."
                filters={{
                    title: 'Filter activity',
                    description:
                        'Show only entries for one event or one model.',
                    fields: [
                        {
                            type: 'select',
                            name: 'event',
                            label: 'Event',
                            options: EVENTS,
                            allLabel: 'All events',
                        },
                        {
                            type: 'text',
                            name: 'subject_type',
                            label: 'Model class',
                        },
                        {
                            type: 'text',
                            name: 'subject_id',
                            label: 'Model ID',
                            inputMode: 'numeric',
                        },
                    ],
                }}
            />
        </ResourcePage>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Activity log',
            href: index.url(),
            icon: <History />,
        },
    ],
};
