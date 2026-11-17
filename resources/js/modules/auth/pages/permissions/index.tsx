import { router } from '@inertiajs/react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
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
    return (
        <ResourcePage title="Permissions">
            <ResourceIndexContent<PermissionRecord>
                caption="Permissions"                
                indexUrl={index.url()}
                dataKey="permissions"
                query={filters}
                pagination={{
                    currentPage: permissions.current_page,
                    lastPage: permissions.last_page,
                    total: permissions.total,
                }}
                rows={permissions.data}
                columns={columns}
                getRowId={(permission) => permission.id}
                emptyState="No permissions found."
                filters={{
                    title: 'Filter permissions',
                    description:
                        'Show permissions whose name or description contains the text.',
                    fields: [
                        { type: 'text', name: 'name', label: 'Name' },
                        {
                            type: 'text',
                            name: 'description',
                            label: 'Description',
                        },
                    ],
                }}
                rowActions={(permission) => [
                    {
                        key: 'view',
                        label: 'View',
                        onAction: () => router.visit(show.url(permission.id)),
                    },
                ]}
            />
        </ResourcePage>
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
