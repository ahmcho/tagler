import { Head, router } from '@inertiajs/react';
import type { DataTableColumn, DataTableSort } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { Card, CardContent } from '@/components/tailgrids/core/card';
import { index, show } from '@/routes/permissions';

type PermissionRecord = {
    id: number;
    name: string;
    description: string | null;
    guard_name: string;
    created_at: string;
};

type Props = {
    permissions: {
        data: PermissionRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        name?: string;
        description?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
};

const columns: DataTableColumn<PermissionRecord>[] = [
    {
        key: 'name',
        header: 'Name',
        accessor: 'name',
        sortable: true,
        className: 'font-mono text-sm',
    },
    {
        key: 'description',
        header: 'Description',
        accessor: 'description',
        sortable: true,
    },
    { key: 'guard_name', header: 'Guard', accessor: 'guard_name' },
];

export default function Index({ permissions, filters }: Props) {
    const currentSort: DataTableSort | null = filters.sort
        ? { key: filters.sort, direction: filters.direction ?? 'asc' }
        : null;

    const visit = (query: Record<string, string | number | undefined>) => {
        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            only: ['permissions', 'filters'],
        });
    };

    return (
        <>
            <Head title="Permissions" />

            <Card>
                <CardContent className="py-5">
                    <DataTable
                        caption="Permissions"
                        subtitle={`Showing ${permissions.total} entries. Modules define permissions; they are read-only here.`}
                        columns={columns}
                        rows={permissions.data}
                        getRowId={(permission) => permission.id}
                        emptyState="No permissions found."
                        actionsHeader="Actions"
                        rowActions={(permission) => [
                            {
                                key: 'view',
                                label: 'View',
                                onAction: () =>
                                    router.visit(show.url(permission.id)),
                            },
                        ]}
                        sort={currentSort}
                        onSortChange={(sort: DataTableSort | null) =>
                            visit({
                                ...filters,
                                sort: sort?.key,
                                direction: sort?.direction,
                            })
                        }
                        pagination={{
                            currentPage: permissions.current_page,
                            lastPage: permissions.last_page,
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
            title: 'Permissions',
            href: index.url(),
        },
    ],
};
