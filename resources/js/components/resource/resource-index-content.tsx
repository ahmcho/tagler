import type { ReactNode } from 'react';
import { useState } from 'react';
import type {
    DataTableBulkAction,
    DataTableColumn,
    DataTableRowAction,
    DataTableRowId,
} from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { Card, CardContent } from '@/components/tailgrids/core/card';
import { useCan } from '@/hooks/use-can';
import {
    ResourceConfirmDialog,
    createPendingConfirm,
} from './resource-confirm-dialog';
import type { PendingConfirm } from './resource-confirm-dialog';
import { ResourceFilterFields } from './resource-filter-fields';
import type {
    ResourceBulkAction,
    ResourceFilters,
    ResourcePagination,
    ResourceQuery,
    ResourceRowAction,
    ResourceSearch,
} from './types';
import { useResourceIndex } from './use-resource-index';

type ResourceIndexContentProps<Row> = {
    caption: string;
    /** Optional text above the table. The row count always shows in the pagination bar. */
    subtitle?: ReactNode;
    indexUrl: string;
    /** Prop name of the rows on the server, for example `roles`. */
    dataKey: string;
    query: ResourceQuery;
    pagination: ResourcePagination;
    rows: Row[];
    columns: DataTableColumn<Row>[];
    getRowId: (row: Row) => DataTableRowId;
    emptyState: ReactNode;
    defaultSortDirection?: 'asc' | 'desc';
    search?: ResourceSearch;
    filters?: ResourceFilters;
    rowActions?: (row: Row) => ResourceRowAction<Row>[];
    bulkActions?: ResourceBulkAction[];
};

const noop = () => {};

/**
 * The list part of a resource page: the card, the table with its search,
 * filters, sort and pagination, and the row and bulk actions with a confirm dialog.
 */
export function ResourceIndexContent<Row>({
    caption,
    subtitle,
    indexUrl,
    dataKey,
    query,
    pagination,
    rows,
    columns,
    getRowId,
    emptyState,
    defaultSortDirection,
    search,
    filters,
    rowActions,
    bulkActions,
}: ResourceIndexContentProps<Row>) {
    const can = useCan();
    const [pending, setPending] = useState<PendingConfirm | null>(null);
    const index = useResourceIndex({
        indexUrl,
        dataKey,
        query,
        fields: filters?.fields ?? [],
        search,
        defaultSortDirection,
    });

    const requestRowAction = (row: Row, action: ResourceRowAction<Row>) => {
        if (!action.confirm) {
            action.onAction(row, { onFinish: noop });

            return;
        }

        setPending(
            createPendingConfirm(action.confirm, row, (options) =>
                action.onAction(row, options),
            ),
        );
    };

    const requestBulkAction = (
        ids: DataTableRowId[],
        action: ResourceBulkAction,
    ) => {
        if (!action.confirm) {
            action.onAction(ids, { onFinish: noop });

            return;
        }

        setPending(
            createPendingConfirm(action.confirm, ids, (options) =>
                action.onAction(ids, options),
            ),
        );
    };

    const confirmPending = () => {
        if (pending === null) {
            return;
        }

        pending.run({
            onFinish: () => {
                setPending(null);
                index.clearSelection();
            },
        });
    };

    const dataTableRowActions = rowActions
        ? (row: Row): DataTableRowAction[] =>
              rowActions(row).map((action) => ({
                  key: action.key,
                  label: action.label,
                  icon: action.icon,
                  permission: action.permission,
                  tone: action.tone,
                  onAction: () => requestRowAction(row, action),
              }))
        : undefined;

    const dataTableBulkActions = bulkActions?.map(
        (action): DataTableBulkAction => ({
            key: action.key,
            label: action.label,
            icon: action.icon,
            permission: action.permission,
            onAction: (selectedRowIds) =>
                requestBulkAction([...selectedRowIds], action),
        }),
    );

    return (
        <>
            <Card>
                <CardContent className="py-5">
                    <DataTable
                        caption={caption}
                        subtitle={subtitle}
                        search={
                            search
                                ? {
                                      value: index.searchValue,
                                      onChange: index.setSearchValue,
                                      onSubmit: index.applyFilters,
                                      placeholder: search.placeholder,
                                      label: search.label,
                                  }
                                : undefined
                        }
                        filter={
                            filters
                                ? {
                                      title: filters.title,
                                      description: filters.description,
                                      activeCount: index.activeFilterCount,
                                      onApply: index.applyFilters,
                                      onReset: index.resetFilters,
                                      children: (
                                          <ResourceFilterFields
                                              fields={filters.fields}
                                              textValues={index.textValues}
                                              optionValues={index.optionValues}
                                              onTextChange={index.setTextValue}
                                              onOptionChange={
                                                  index.setOptionValue
                                              }
                                          />
                                      ),
                                  }
                                : undefined
                        }
                        bulkActions={dataTableBulkActions}
                        selection={
                            bulkActions
                                ? {
                                      selectedIds: index.selectedIds,
                                      onChange: index.setSelectedIds,
                                  }
                                : undefined
                        }
                        columns={columns}
                        rows={rows}
                        getRowId={getRowId}
                        emptyState={emptyState}
                        isLoading={index.isLoading}
                        sort={index.sort}
                        onSortChange={index.changeSort}
                        actionsHeader={rowActions ? 'Actions' : undefined}
                        can={can}
                        rowActions={dataTableRowActions}
                        pagination={{
                            currentPage: pagination.currentPage,
                            lastPage: pagination.lastPage,
                            onPageChange: index.changePage,
                            summary: `Showing ${pagination.total} entries`,
                        }}
                    />
                </CardContent>
            </Card>

            <ResourceConfirmDialog
                pending={pending}
                onClose={() => setPending(null)}
                onConfirm={confirmPending}
            />
        </>
    );
}
