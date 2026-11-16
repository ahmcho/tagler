import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { DataTableColumn, DataTableSort } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { SelectField } from '@/components/select-field';
import { Card, CardContent } from '@/components/tailgrids/core/card';
import { FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { index } from '@/routes/activity-logs';

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
    const [event, setEvent] = useState(filters.event ?? '');
    const [subjectType, setSubjectType] = useState(filters.subject_type ?? '');
    const [subjectId, setSubjectId] = useState(
        filters.subject_id !== undefined ? String(filters.subject_id) : '',
    );

    const currentSort: DataTableSort | null = filters.sort
        ? { key: filters.sort, direction: filters.direction ?? 'desc' }
        : null;

    const visit = (query: Record<string, string | number | undefined>) => {
        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            only: ['records', 'filters'],
        });
    };

    const submitFilters = () => {
        visit({
            event: event || undefined,
            subject_type: subjectType || undefined,
            subject_id: subjectId || undefined,
            sort: filters.sort,
            direction: filters.direction,
        });
    };

    const resetFilters = () => {
        setEvent('');
        setSubjectType('');
        setSubjectId('');
        visit({ sort: filters.sort, direction: filters.direction });
    };

    return (
        <>
            <Head title="Activity log" />

            <Card>
                <CardContent className="py-5">
                    <DataTable
                        caption="Activity log"
                        subtitle={`Showing ${records.total} entries`}
                        filter={{
                            title: 'Filter activity',
                            description:
                                'Show only entries for one event or one model.',
                            activeCount:
                                (filters.event ? 1 : 0) +
                                (filters.subject_type ? 1 : 0) +
                                (filters.subject_id !== undefined ? 1 : 0),
                            onApply: submitFilters,
                            onReset: resetFilters,
                            children: (
                                <div className="space-y-4">
                                    <SelectField
                                        label="Event"
                                        value={event}
                                        onChange={setEvent}
                                        options={EVENTS}
                                        allOptionLabel="All events"
                                    />
                                    <TextField
                                        value={subjectType}
                                        onChange={setSubjectType}
                                        className="flex w-full flex-col gap-1.5"
                                    >
                                        <FieldLabel>Model class</FieldLabel>
                                        <Input className="w-full" />
                                    </TextField>
                                    <TextField
                                        value={subjectId}
                                        onChange={setSubjectId}
                                        className="flex w-full flex-col gap-1.5"
                                    >
                                        <FieldLabel>Model ID</FieldLabel>
                                        <Input
                                            inputMode="numeric"
                                            className="w-full"
                                        />
                                    </TextField>
                                </div>
                            ),
                        }}
                        columns={columns}
                        rows={records.data}
                        getRowId={(log) => log.id}
                        emptyState="No activity found."
                        sort={currentSort}
                        onSortChange={(sort: DataTableSort | null) =>
                            visit({
                                ...filters,
                                sort: sort?.key,
                                direction: sort?.direction,
                            })
                        }
                        pagination={{
                            currentPage: records.current_page,
                            lastPage: records.last_page,
                            onPageChange: (page) => visit({ ...filters, page }),
                        }}
                    />
                </CardContent>
            </Card>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Activity log',
            href: index.url(),
        },
    ],
};
