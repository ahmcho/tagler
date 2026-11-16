import { Head, router } from '@inertiajs/react';
import { Download, Pencil, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type {
    DataTableBulkAction,
    DataTableColumn,
    DataTableRowId,
    DataTableSort,
} from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { SelectField } from '@/components/select-field';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import { Card, CardContent } from '@/components/tailgrids/core/card';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogIcon,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import { useCan } from '@/hooks/use-can';
import { edit, index, reset } from '@/routes/translations';
import { downloadCsv } from '@/utils/download-csv';

type TranslationRecord = {
    id: number;
    lang: string;
    group: string;
    table: string | null;
    key: string;
    value: string | null;
    updated_at: string;
};

type Filters = {
    group?: string;
    key?: string;
    table?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
};

type Props = {
    records: {
        data: TranslationRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    groups: string[];
    tables: string[];
    filters: Filters;
    status?: string | null;
};

const columns: DataTableColumn<TranslationRecord>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'group', header: 'Group', sortable: true },
    { key: 'key', header: 'Key', sortable: true },
    { key: 'value', header: 'Value' },
    { key: 'updated_at', header: 'Updated', sortable: true },
];

const exportColumns: (keyof TranslationRecord & string)[] = [
    'id',
    'lang',
    'group',
    'table',
    'key',
    'value',
    'updated_at',
];

export default function Index({
    records,
    groups,
    tables,
    filters,
    status,
}: Props) {
    const [group, setGroup] = useState(filters.group ?? '');
    const [key, setKey] = useState(filters.key ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<DataTableRowId>>(
        new Set(),
    );
    const [pendingResetIds, setPendingResetIds] = useState<
        DataTableRowId[] | null
    >(null);
    const can = useCan();

    const currentSort: DataTableSort | null = filters.sort
        ? { key: filters.sort, direction: filters.direction ?? 'asc' }
        : null;

    const visit = (query: Record<string, string | number | undefined>) => {
        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            only: ['records', 'filters', 'status'],
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: () => setSelectedIds(new Set()),
        });
    };

    const submitFilters = () => {
        visit({
            group: group || undefined,
            key: key || undefined,
            table: filters.table,
            sort: filters.sort,
            direction: filters.direction,
        });
    };

    const resetGroupFilter = () => {
        setGroup('');
        visit({
            key: key || undefined,
            table: filters.table,
            sort: filters.sort,
            direction: filters.direction,
        });
    };

    const changeSort = (sort: DataTableSort | null) => {
        visit({
            ...filters,
            sort: sort?.key,
            direction: sort?.direction,
        });
    };

    const exportSelected = (selectedRowIds: ReadonlySet<DataTableRowId>) => {
        downloadCsv(
            'translations.csv',
            records.data.filter((row) => selectedRowIds.has(row.id)),
            exportColumns,
        );
    };

    const confirmReset = () => {
        if (pendingResetIds === null) {
            return;
        }

        router.post(
            reset.url(),
            { ids: pendingResetIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds(new Set());
                    setPendingResetIds(null);
                },
            },
        );
    };

    const bulkActions: DataTableBulkAction[] = [
        {
            key: 'export',
            label: 'Export selected as CSV',
            icon: <Download className="size-4" />,
            onAction: exportSelected,
        },
        {
            key: 'reset',
            label: 'Reset to file default',
            icon: <RotateCcw className="size-4" />,
            permission: 'translations.update',
            onAction: (selectedRowIds) =>
                setPendingResetIds([...selectedRowIds]),
        },
    ];

    return (
        <>
            <Head title="Translations" />

            <div className="space-y-6">
                {status && (
                    <Alert status="success">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{status}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                <Card>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                appearance={filters.table ? 'outline' : 'fill'}
                                onPress={() =>
                                    visit({
                                        group: filters.group,
                                        key: filters.key,
                                        sort: filters.sort,
                                        direction: filters.direction,
                                    })
                                }
                            >
                                All tables
                            </Button>
                            {tables.map((table) => (
                                <Button
                                    key={table}
                                    size="sm"
                                    appearance={
                                        filters.table === table
                                            ? 'fill'
                                            : 'outline'
                                    }
                                    onPress={() =>
                                        visit({
                                            table,
                                            sort: filters.sort,
                                            direction: filters.direction,
                                        })
                                    }
                                >
                                    {table}
                                </Button>
                            ))}
                        </div>

                        <DataTable
                            caption="Translations"
                            title="Translations"
                            subtitle={`Edit stored translations for each supported locale. Showing ${records.total} entries.`}
                            search={{
                                value: key,
                                onChange: setKey,
                                onSubmit: submitFilters,
                                placeholder: 'Search by key, e.g. common.save',
                                label: 'Search by key',
                            }}
                            filter={{
                                title: 'Filter translations',
                                description:
                                    'Show only translations from one group.',
                                activeCount: filters.group ? 1 : 0,
                                onApply: submitFilters,
                                onReset: resetGroupFilter,
                                children: (
                                    <SelectField
                                        label="Group"
                                        value={group}
                                        onChange={setGroup}
                                        options={groups}
                                        allOptionLabel="All groups"
                                    />
                                ),
                            }}
                            bulkActions={bulkActions}
                            selection={{
                                selectedIds,
                                onChange: setSelectedIds,
                            }}
                            columns={columns}
                            rows={records.data}
                            getRowId={(translation) => translation.id}
                            emptyState="No translations found."
                            isLoading={isLoading}
                            sort={currentSort}
                            onSortChange={changeSort}
                            actionsHeader="Actions"
                            can={can}
                            rowActions={(translation) => [
                                {
                                    key: 'edit',
                                    label: 'Edit',
                                    icon: <Pencil className="size-4" />,
                                    permission: 'translations.update',
                                    onAction: () =>
                                        router.visit(
                                            edit.url([
                                                translation.group,
                                                translation.key,
                                            ]),
                                        ),
                                },
                            ]}
                            pagination={{
                                currentPage: records.current_page,
                                lastPage: records.last_page,
                                onPageChange: (page) =>
                                    visit({ ...filters, page }),
                            }}
                        />
                    </CardContent>
                </Card>

                <Dialog
                    isOpen={pendingResetIds !== null}
                    isDismissable
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setPendingResetIds(null);
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogIcon tone="danger">
                            <RotateCcw />
                        </DialogIcon>
                        <DialogTitle>Reset to file defaults</DialogTitle>
                        <DialogDescription>
                            {`Reset ${pendingResetIds?.length ?? 0} selected translation(s) to their file defaults? This overwrites the current values in all locales.`}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            appearance="outline"
                            onPress={() => setPendingResetIds(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onPress={confirmReset}>
                            Reset
                        </Button>
                    </DialogFooter>
                </Dialog>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Translations',
            href: index.url(),
        },
    ],
};
