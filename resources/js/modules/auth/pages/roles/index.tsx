import { router } from '@inertiajs/react';
import { Eye, Plus, ShieldCheck } from 'lucide-react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
import type { SelectOption } from '@/components/searchable-list';
import { Button } from '@/components/tailgrids/core/button';
import { useAbility } from '@/hooks/use-ability';
import { useSearch } from '@/hooks/use-search';
import { roleRowActions } from '@/modules/auth/components/role-row-actions';
import type { RoleRecord } from '@/modules/auth/components/role-row-actions';
import { search as permissionsSearch } from '@/routes/permissions';
import { create, index, show } from '@/routes/roles';

type Props = {
    roles: {
        data: RoleRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        name?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
        permission?: number;
    };
    selectedPermission: { id: number; name: string } | null;
};

const columns: DataTableColumn<RoleRecord>[] = [
    { key: 'id', header: 'ID', accessor: 'id', sortable: true },
    { key: 'name', header: 'Name', accessor: 'name', sortable: true },
    {
        key: 'permissions',
        header: 'Permissions',
        cell: (role) => role.permissions.length,
    },
    {
        key: 'created_at',
        header: 'Created',
        cell: (role) => role.created_at,
        sortable: true,
    },
];

export default function Index({ roles, filters, selectedPermission }: Props) {
    const ability = useAbility();
    const { loadOptions: loadPermissions } = useSearch<{
        id: number;
        name: string;
    }>({
        route: permissionsSearch,
        toOption: (permission) => ({
            value: permission.id,
            label: permission.name,
        }),
    });

    return (
        <ResourcePage title="Roles">
            <ResourceIndexContent<RoleRecord>
                caption="Roles"
                subtitle={
                    ability('roles.store') ? (
                        <Button onPress={() => router.visit(create.url())}>
                            <Plus className="size-4" />
                            New role
                        </Button>
                    ) : undefined
                }
                indexUrl={index.url()}
                dataKey="roles"
                query={filters}
                pagination={{
                    currentPage: roles.current_page,
                    lastPage: roles.last_page,
                    total: roles.total,
                }}
                rows={roles.data}
                columns={columns}
                getRowId={(role) => role.id}
                emptyState="No roles found."
                filters={{
                    title: 'Filter roles',
                    description: 'Show only roles that hold a permission.',
                    fields: [
                        {
                            type: 'searchable',
                            name: 'permission',
                            label: 'Permission',
                            placeholder: 'Search permissions...',
                            loadingMessage: 'Searching permissions...',
                            noOptionsMessage: 'No permissions found',
                            loadOptions: loadPermissions,
                            initialOption: selectedPermission
                                ? toOption(selectedPermission)
                                : null,
                        },
                    ],
                }}
                rowActions={(role) => [
                    {
                        key: 'view',
                        label: 'View',
                        icon: <Eye className="size-4" />,
                        tone: 'primary' as const,
                        onAction: () => router.visit(show.url(role.id)),
                    },
                    ...roleRowActions(role),
                ]}
            />
        </ResourcePage>
    );
}

function toOption(permission: { id: number; name: string }): SelectOption {
    return { value: permission.id, label: permission.name };
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Roles',
            href: index.url(),
            icon: <ShieldCheck />,
        },
    ],
};
