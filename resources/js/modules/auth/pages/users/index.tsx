import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { DataTableColumn, DataTableSort } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { SearchableList } from '@/components/searchable-list';
import type { SelectOption } from '@/components/searchable-list';
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
import { useAbility } from '@/hooks/use-ability';
import { useCan } from '@/hooks/use-can';
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
    const { loadOptions: loadRoles } = useSearch<{ id: number; name: string }>({
        route: rolesSearch,
        toOption: (role) => ({ value: role.id, label: role.name }),
    });
    const [pendingDelete, setPendingDelete] = useState<UserRecord | null>(null);
    const [roleFilter, setRoleFilter] = useState<SelectOption | null>(
        selectedRole
            ? { value: selectedRole.id, label: selectedRole.name }
            : null,
    );
    const can = useCan();
    const ability = useAbility();

    const currentSort: DataTableSort | null = filters.sort
        ? { key: filters.sort, direction: filters.direction ?? 'asc' }
        : null;

    const visit = (query: Record<string, string | number | undefined>) => {
        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            only: ['users', 'filters', 'status'],
        });
    };

    const submitFilters = () => {
        visit({
            role: roleFilter?.value,
            sort: filters.sort,
            direction: filters.direction,
        });
    };

    const resetFilters = () => {
        setRoleFilter(null);
        visit({ sort: filters.sort, direction: filters.direction });
    };

    const confirmDelete = () => {
        if (pendingDelete === null) {
            return;
        }

        router.delete(destroy.url(pendingDelete.id), {
            preserveScroll: true,
            onSuccess: () => setPendingDelete(null),
        });
    };

    return (
        <>
            <Head title="Users" />

            <div className="space-y-6">
                {status && (
                    <Alert status="success">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{status}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                {ability('users.store') && (
                    <div className="flex justify-end">
                        <Button onPress={() => router.visit(create.url())}>
                            <Plus className="size-4" />
                            New user
                        </Button>
                    </div>
                )}

                <Card>
                    <CardContent className="py-5">
                        <DataTable
                            caption="Users"
                            subtitle={`Showing ${users.total} entries`}
                            columns={columns}
                            rows={users.data}
                            getRowId={(user) => user.id}
                            emptyState="No users found."
                            sort={currentSort}
                            onSortChange={(sort: DataTableSort | null) =>
                                visit({
                                    ...filters,
                                    sort: sort?.key,
                                    direction: sort?.direction,
                                })
                            }
                            filter={{
                                title: 'Filter users',
                                description: 'Show only users who hold a role.',
                                activeCount: filters.role ? 1 : 0,
                                onApply: submitFilters,
                                onReset: resetFilters,
                                children: (
                                    <SearchableList
                                        inputId="role-filter"
                                        instanceId="role-filter"
                                        placeholder="Search roles..."
                                        loadingMessage="Searching roles..."
                                        noOptionsMessage="No roles found"
                                        loadOptions={loadRoles}
                                        value={roleFilter}
                                        onChange={setRoleFilter}
                                    />
                                ),
                            }}
                            actionsHeader="Actions"
                            can={can}
                            rowActions={(user) => [
                                {
                                    key: 'view',
                                    label: 'View',
                                    onAction: () =>
                                        router.visit(show.url(user.id)),
                                },
                                ...(user.can.update
                                    ? [
                                          {
                                              key: 'edit',
                                              label: 'Edit',
                                              icon: (
                                                  <Pencil className="size-4" />
                                              ),
                                              onAction: () =>
                                                  router.visit(
                                                      edit.url(user.id),
                                                  ),
                                          },
                                      ]
                                    : []),
                                ...(user.can.delete
                                    ? [
                                          {
                                              key: 'delete',
                                              label: 'Delete',
                                              icon: (
                                                  <Trash2 className="size-4" />
                                              ),
                                              tone: 'danger' as const,
                                              onAction: () =>
                                                  setPendingDelete(user),
                                          },
                                      ]
                                    : []),
                            ]}
                            pagination={{
                                currentPage: users.current_page,
                                lastPage: users.last_page,
                                onPageChange: (page) =>
                                    visit({ ...filters, page }),
                            }}
                        />
                    </CardContent>
                </Card>

                <Dialog
                    isOpen={pendingDelete !== null}
                    isDismissable
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setPendingDelete(null);
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogIcon tone="danger">
                            <Trash2 />
                        </DialogIcon>
                        <DialogTitle>Delete user</DialogTitle>
                        <DialogDescription>
                            {`Delete the user "${pendingDelete?.name ?? ''}"? This cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            appearance="outline"
                            onPress={() => setPendingDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onPress={confirmDelete}>
                            Delete
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
            title: 'Users',
            href: index.url(),
        },
    ],
};
