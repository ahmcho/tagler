import { router } from '@inertiajs/react';
import { Download, Languages, Pencil, RotateCcw } from 'lucide-react';
import type { DataTableColumn, DataTableRowId } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
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
    const exportSelected = (selectedRowIds: DataTableRowId[]) => {
        downloadCsv(
            'translations.csv',
            records.data.filter((row) => selectedRowIds.includes(row.id)),
            exportColumns,
        );
    };

    return (
        <ResourcePage title="Translations" status={status}>
            <ResourceIndexContent<TranslationRecord>
                caption="Translations"
                indexUrl={index.url()}
                dataKey="records"
                query={filters}
                pagination={{
                    currentPage: records.current_page,
                    lastPage: records.last_page,
                    total: records.total,
                }}
                rows={records.data}
                columns={columns}
                getRowId={(translation) => translation.id}
                emptyState="No translations found."
                search={{
                    name: 'key',
                    label: 'Search by key',
                    placeholder: 'Search by key, e.g. common.save',
                }}
                filters={{
                    title: 'Filter translations',
                    description:
                        'Show only translations from one table or group.',
                    fields: [
                        {
                            type: 'select',
                            name: 'table',
                            label: 'Table',
                            options: tables,
                            allLabel: 'All tables',
                        },
                        {
                            type: 'select',
                            name: 'group',
                            label: 'Group',
                            options: groups,
                            allLabel: 'All groups',
                        },
                    ],
                }}
                rowActions={(translation) => [
                    {
                        key: 'edit',
                        label: 'Edit',
                        icon: <Pencil className="size-4" />,
                        tone: 'success',
                        permission: 'translations.update',
                        onAction: () =>
                            router.visit(
                                edit.url([translation.group, translation.key]),
                            ),
                    },
                ]}
                bulkActions={[
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
                        confirm: {
                            title: 'Reset to file defaults',
                            description: (ids) =>
                                `Reset ${ids.length} selected translation(s) to their file defaults? This overwrites the current values in all locales.`,
                            confirmLabel: 'Reset',
                            icon: <RotateCcw />,
                            tone: 'danger',
                        },
                        onAction: (ids, { onFinish }) =>
                            router.post(
                                reset.url(),
                                { ids },
                                { preserveScroll: true, onFinish },
                            ),
                    },
                ]}
            />
        </ResourcePage>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Translations',
            href: index.url(),
            icon: <Languages />,
        },
    ],
};
