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
import { search as rolesSearch } from '@/routes/roles';
import { create, destroy, edit, index, show } from '@/routes/users';

type UserRecord = {
    id: number;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
    created_at: string;
    can: { update: boolean; delete: boolean };
};

type Props = {
    users: {
        data: UserRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { sort?: string; direction?: 'asc' | 'desc'; role?: number };
    selectedRole: { id: number; name: string } | null;
    status?: string | null;
};

const columns: DataTableColumn<UserRecord>[] = [
    { key: 'name', header: 'Name', accessor: 'name', sortable: true },
    { key: 'email', header: 'Email', accessor: 'email', sortable: true },
    {
        key: 'roles',
        header: 'Roles',
        cell: (user) => user.roles.map((role) => role.name).join(', ') || '—',
    },
    {
        key: 'created_at',
        header: 'Created',
        cell: (user) => user.created_at,
        sortable: true,
    },
];

export default function Index({ users, filters, selectedRole, status }: Props) {
    const ability = useAbility();
    const { loadOptions: loadRoles } = useSearch<{ id: number; name: string }>({
        route: rolesSearch,
        toOption: (role) => ({ value: role.id, label: role.name }),
    });

    return (
        <ResourcePage title="Users" status={status}>
            <ResourceIndexContent<UserRecord>
                caption="Users"
                subtitle={
                    ability('users.store') ? (
                        <Button onPress={() => router.visit(create.url())}>
                            <Plus className="size-4" />
                            New user
                        </Button>
                    ) : undefined
                }
                indexUrl={index.url()}
                dataKey="users"
                query={filters}
                pagination={{
                    currentPage: users.current_page,
                    lastPage: users.last_page,
                    total: users.total,
                }}
                rows={users.data}
                columns={columns}
                getRowId={(user) => user.id}
                emptyState="No users found."
                filters={{
                    title: 'Filter users',
                    description: 'Show only users who hold a role.',
                    fields: [
                        {
                            type: 'searchable',
                            name: 'role',
                            label: 'Role',
                            placeholder: 'Search roles...',
                            loadingMessage: 'Searching roles...',
                            noOptionsMessage: 'No roles found',
                            loadOptions: loadRoles,
                            initialOption: selectedRole
                                ? toOption(selectedRole)
                                : null,
                        },
                    ],
                }}
                rowActions={(user) => [
                    {
                        key: 'view',
                        label: 'View',
                        onAction: () => router.visit(show.url(user.id)),
                    },
                    ...(user.can.update
                        ? [
                              {
                                  key: 'edit',
                                  label: 'Edit',
                                  icon: <Pencil className="size-4" />,
                                  onAction: () =>
                                      router.visit(edit.url(user.id)),
                              },
                          ]
                        : []),
                    ...(user.can.delete
                        ? [
                              {
                                  key: 'delete',
                                  label: 'Delete',
                                  icon: <Trash2 className="size-4" />,
                                  tone: 'danger' as const,
                                  confirm: {
                                      title: 'Delete user',
                                      description: (target: UserRecord) =>
                                          `Delete the user "${target.name}"? This cannot be undone.`,
                                      confirmLabel: 'Delete',
                                      icon: <Trash2 />,
                                      tone: 'danger' as const,
                                  },
                                  onAction: (
                                      target: UserRecord,
                                      options: ResourceActionOptions,
                                  ) =>
                                      router.delete(destroy.url(target.id), {
                                          preserveScroll: true,
                                          onSuccess: options.onSuccess,
                                      }),
                              },
                          ]
                        : []),
                ]}
            />
        </ResourcePage>
    );
}

function toOption(role: { id: number; name: string }): SelectOption {
    return { value: role.id, label: role.name };
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: index.url(),
        },
    ],
};
