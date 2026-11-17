import { router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
import type { ResourceActionOptions } from '@/components/resource/types';
import type { SelectOption } from '@/components/searchable-list';
import { Button } from '@/components/tailgrids/core/button';
import { useAbility } from '@/hooks/use-ability';
import { useSearch } from '@/hooks/use-search';
import { index as activityLogIndex } from '@/routes/activity-logs';
import { search as permissionsSearch } from '@/routes/permissions';
import { create, destroy, edit, index, show } from '@/routes/roles';

type RoleRecord = {
    id: number;
    name: string;
    guard_name: string;
    permissions: { id: number; name: string }[];
    created_at: string;
    can: { update: boolean; delete: boolean };
};

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
    status?: string | null;
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

export default function Index({
    roles,
    filters,
    selectedPermission,
    status,
}: Props) {
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
        <ResourcePage title="Roles" status={status}>
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
                        onAction: () => router.visit(show.url(role.id)),
                    },
                    ...(role.can.update
                        ? [
                              {
                                  key: 'edit',
                                  label: 'Edit',
                                  icon: <Pencil className="size-4" />,
                                  onAction: () =>
                                      router.visit(edit.url(role.id)),
                              },
                          ]
                        : []),
                    ...(role.can.delete
                        ? [
                              {
                                  key: 'delete',
                                  label: 'Delete',
                                  icon: <Trash2 className="size-4" />,
                                  tone: 'danger' as const,
                                  confirm: {
                                      title: 'Delete role',
                                      description: (target: RoleRecord) =>
                                          `Delete the role "${target.name}"? Users who hold it lose its permissions.`,
                                      confirmLabel: 'Delete',
                                      icon: <Trash2 />,
                                      tone: 'danger' as const,
                                  },
                                  onAction: (
                                      target: RoleRecord,
                                      options: ResourceActionOptions,
                                  ) =>
                                      router.delete(destroy.url(target.id), {
                                          preserveScroll: true,
                                          onSuccess: options.onSuccess,
                                      }),
                              },
                          ]
                        : []),
                    ...(ability('activity-logs.index')
                        ? [
                              {
                                  key: 'logs',
                                  label: 'Activity',
                                  onAction: () =>
                                      router.visit(
                                          activityLogIndex.url({
                                              query: {
                                                  subject_type:
                                                      'App\\Modules\\Auth\\Models\\Role',
                                                  subject_id: role.id,
                                              },
                                          }),
                                      ),
                              },
                          ]
                        : []),
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
        },
    ],
};
