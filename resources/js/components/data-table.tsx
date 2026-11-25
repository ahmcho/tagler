import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { DataTableBody, DataTableHeader } from '@/components/data-table-body';
import { isPermitted } from '@/components/data-table-menu';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import type {
    DataTableBulkAction,
    DataTableFilter,
    DataTablePagination,
    DataTableProps,
    DataTableRowId,
    DataTableSearch,
    DataTableSelection,
} from '@/components/data-table-types';
import { Pagination } from '@/components/tailgrids/core/pagination';
import { TableRoot } from '@/components/tailgrids/core/table';
import { cn } from '@/utils/cn';

export type * from '@/components/data-table-types';
export {
    DataTableMenuItems,
    menuContentClassName,
} from '@/components/data-table-menu';

function withIdsToggled(
    selectedIds: ReadonlySet<DataTableRowId>,
    rowIds: DataTableRowId[],
    checked: boolean,
): Set<DataTableRowId> {
    const nextSelectedIds = new Set(selectedIds);

    rowIds.forEach((rowId) => {
        if (checked) {
            nextSelectedIds.add(rowId);
        } else {
            nextSelectedIds.delete(rowId);
        }
    });

    return nextSelectedIds;
}

function hasToolbarContent(
    title: ReactNode,
    subtitle: ReactNode,
    search: DataTableSearch | undefined,
    filter: DataTableFilter | undefined,
    visibleBulkActionCount: number,
): boolean {
    const hasHeadingOrControls = [title, subtitle, search, filter].some(
        (part) => part !== undefined,
    );

    return hasHeadingOrControls || visibleBulkActionCount > 0;
}

/** Columns in the table, plus one for the checkbox and one for the row actions. */
function countRenderedColumns(
    columnCount: number,
    hasSelection: boolean,
    hasActions: boolean,
): number {
    return columnCount + Number(hasSelection) + Number(hasActions);
}

/** Rows that can be checked. A row is skipped when `isRowDisabled` returns true. */
function getSelectableRows<Row>(
    rows: Row[],
    selection: DataTableSelection<Row> | undefined,
): Row[] {
    if (!selection) {
        return [];
    }

    return rows.filter((row) => !selection.isRowDisabled?.(row));
}

function getVisibleBulkActions(
    bulkActions: DataTableBulkAction[] | undefined,
    can: ((permission: string) => boolean) | undefined,
): DataTableBulkAction[] {
    return (bulkActions ?? []).filter((action) => isPermitted(action, can));
}

/** True when every selectable row on the page is selected. */
function areAllRowsSelected<Row>(
    selectableRows: Row[],
    selection: DataTableSelection<Row> | undefined,
    getRowId: (row: Row) => DataTableRowId,
): boolean {
    if (selection === undefined || selectableRows.length === 0) {
        return false;
    }

    return selectableRows.every((row) =>
        selection.selectedIds.has(getRowId(row)),
    );
}

/** The page links and summary under the table. Shown when there is more than one page or a summary. */
function DataTablePaginationBar({
    pagination,
}: {
    pagination: DataTablePagination;
}) {
    if (pagination.lastPage <= 1 && !pagination.summary) {
        return null;
    }

    return (
        <div className="flex justify-center">
            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.lastPage}
                onPageChange={pagination.onPageChange}
                variant={pagination.variant}
                summary={pagination.summary}
            />
        </div>
    );
}

export function DataTable<Row>({
    columns,
    rows,
    getRowId,
    caption,
    title,
    subtitle,
    search,
    filter,
    bulkActions,
    fullBleed,
    className,
    rowClassName,
    isLoading = false,
    loadingRowCount = 5,
    emptyState = 'No records found.',
    sort,
    onSortChange,
    selection,
    rowActions,
    can,
    actionsHeader,
    pagination,
}: DataTableProps<Row>) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const hasSelection = selection !== undefined;
    const hasActions = rowActions !== undefined;
    const columnCount = countRenderedColumns(
        columns.length,
        hasSelection,
        hasActions,
    );

    const selectableRows = getSelectableRows(rows, selection);
    const areAllSelected = areAllRowsSelected(
        selectableRows,
        selection,
        getRowId,
    );

    const visibleBulkActions = getVisibleBulkActions(bulkActions, can);
    const hasToolbar = hasToolbarContent(
        title,
        subtitle,
        search,
        filter,
        visibleBulkActions.length,
    );

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
        if (!selection) {
            return;
        }

        selection.onChange(
            withIdsToggled(
                selection.selectedIds,
                selectableRows.map((row) => getRowId(row)),
                event.target.checked,
            ),
        );
    };

    const handleSelectRow = (row: Row, checked: boolean) => {
        if (!selection) {
            return;
        }

        selection.onChange(
            withIdsToggled(selection.selectedIds, [getRowId(row)], checked),
        );
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        search?.onSubmit?.();
    };

    return (
        <div className={cn('space-y-6', className)}>
            {hasToolbar && (
                <DataTableToolbar
                    title={title}
                    subtitle={subtitle}
                    search={search}
                    onSearchSubmit={handleSearchSubmit}
                    filter={filter}
                    isFilterOpen={isFilterOpen}
                    onFilterOpenChange={setIsFilterOpen}
                    selection={selection}
                    bulkActions={visibleBulkActions}
                />
            )}

            <TableRoot aria-label={caption} fullBleed={fullBleed}>
                <DataTableHeader
                    columns={columns}
                    sort={sort}
                    onSortChange={onSortChange}
                    hasSelection={hasSelection}
                    areAllSelected={areAllSelected}
                    hasSelectableRows={selectableRows.length > 0}
                    onSelectAll={handleSelectAll}
                    hasActions={hasActions}
                    actionsHeader={actionsHeader}
                />
                <DataTableBody
                    rows={rows}
                    getRowId={getRowId}
                    columns={columns}
                    columnCount={columnCount}
                    isLoading={isLoading}
                    loadingRowCount={loadingRowCount}
                    emptyState={emptyState}
                    selection={selection}
                    onSelectRow={handleSelectRow}
                    rowClassName={rowClassName}
                    rowActions={rowActions}
                    can={can}
                />
            </TableRoot>

            {pagination && <DataTablePaginationBar pagination={pagination} />}
        </div>
    );
}
