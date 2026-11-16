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
    const [pendingDelete, setPendingDelete] = useState<RoleRecord | null>(null);
    const [permissionFilter, setPermissionFilter] =
        useState<SelectOption | null>(
            selectedPermission
                ? {
                      value: selectedPermission.id,
                      label: selectedPermission.name,
                  }
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
            only: ['roles', 'filters', 'status'],
        });
    };

    const submitFilters = () => {
        visit({
            permission: permissionFilter?.value,
            sort: filters.sort,
            direction: filters.direction,
        });
    };

    const resetFilters = () => {
        setPermissionFilter(null);
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
            <Head title="Roles" />

            <div className="space-y-6">
                {status && (
                    <Alert status="success">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{status}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                {ability('roles.store') && (
                    <div className="flex justify-end">
                        <Button onPress={() => router.visit(create.url())}>
                            <Plus className="size-4" />
                            New role
                        </Button>
                    </div>
                )}

                <Card>
                    <CardContent className="py-5">
                        <DataTable
                            caption="Roles"
                            subtitle={`Showing ${roles.total} entries`}
                            filter={{
                                title: 'Filter roles',
                                description:
                                    'Show only roles that hold a permission.',
                                activeCount: filters.permission ? 1 : 0,
                                onApply: submitFilters,
                                onReset: resetFilters,
                                children: (
                                    <SearchableList
                                        inputId="permission-filter"
                                        instanceId="permission-filter"
                                        placeholder="Search permissions..."
                                        loadingMessage="Searching permissions..."
                                        noOptionsMessage="No permissions found"
                                        loadOptions={loadPermissions}
                                        value={permissionFilter}
                                        onChange={setPermissionFilter}
                                    />
                                ),
                            }}
                            columns={columns}
                            rows={roles.data}
                            getRowId={(role) => role.id}
                            emptyState="No roles found."
                            sort={currentSort}
                            onSortChange={(sort: DataTableSort | null) =>
                                visit({
                                    ...filters,
                                    sort: sort?.key,
                                    direction: sort?.direction,
                                })
                            }
                            actionsHeader="Actions"
                            can={can}
                            rowActions={(role) => [
                                {
                                    key: 'view',
                                    label: 'View',
                                    onAction: () =>
                                        router.visit(show.url(role.id)),
                                },
                                ...(role.can.update
                                    ? [
                                          {
                                              key: 'edit',
                                              label: 'Edit',
                                              icon: (
                                                  <Pencil className="size-4" />
                                              ),
                                              onAction: () =>
                                                  router.visit(
                                                      edit.url(role.id),
                                                  ),
                                          },
                                      ]
                                    : []),
                                ...(role.can.delete
                                    ? [
                                          {
                                              key: 'delete',
                                              label: 'Delete',
                                              icon: (
                                                  <Trash2 className="size-4" />
                                              ),
                                              tone: 'danger' as const,
                                              onAction: () =>
                                                  setPendingDelete(role),
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
                                                              subject_id:
                                                                  role.id,
                                                          },
                                                      }),
                                                  ),
                                          },
                                      ]
                                    : []),
                            ]}
                            pagination={{
                                currentPage: roles.current_page,
                                lastPage: roles.last_page,
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
                        <DialogTitle>Delete role</DialogTitle>
                        <DialogDescription>
                            {`Delete the role "${pendingDelete?.name ?? ''}"? Users who hold it lose its permissions.`}
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
            title: 'Roles',
            href: index.url(),
        },
    ],
};
