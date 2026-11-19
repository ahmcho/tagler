import { router } from '@inertiajs/react';
import { Eye, Plus, Users } from 'lucide-react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
import type { SelectOption } from '@/components/searchable-list';
import { Button } from '@/components/tailgrids/core/button';
import { useAbility } from '@/hooks/use-ability';
import { useSearch } from '@/hooks/use-search';
import { userRowActions } from '@/modules/auth/components/user-row-actions';
import type { UserRecord } from '@/modules/auth/components/user-row-actions';
import { UserStatusBadge } from '@/modules/auth/components/user-status-badge';
import { search as rolesSearch } from '@/routes/roles';
import { create, index, show } from '@/routes/users';

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
        key: 'status',
        header: 'Status',
        cell: (user) => <UserStatusBadge status={user.status} />,
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
                        icon: <Eye className="size-4" />,
                        tone: 'primary' as const,
                        onAction: () => router.visit(show.url(user.id)),
                    },
                    ...userRowActions(user),
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
            icon: <Users />,
        },
    ],
};
