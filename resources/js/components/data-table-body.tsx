import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { RowActionsMenu } from '@/components/data-table-menu';
import type {
    DataTableColumn,
    DataTableRowAction,
    DataTableRowId,
    DataTableSelection,
    DataTableSort,
} from '@/components/data-table-types';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/tailgrids/core/table';
import { cn } from '@/utils/cn';

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const;

function sortKeyOf<Row>(column: DataTableColumn<Row>): string {
    return column.sortKey ?? column.key;
}

/** Click order: ascending, then descending, then no sort. */
function nextSortFor<Row>(
    column: DataTableColumn<Row>,
    sort: DataTableSort | null | undefined,
): DataTableSort | null {
    const sortKey = sortKeyOf(column);

    if (sort?.key !== sortKey) {
        return { key: sortKey, direction: 'asc' };
    }

    if (sort.direction === 'asc') {
        return { key: sortKey, direction: 'desc' };
    }

    return null;
}

function ariaSortFor<Row>(
    column: DataTableColumn<Row>,
    sort: DataTableSort | null | undefined,
): 'ascending' | 'descending' | 'none' | undefined {
    if (!column.sortable) {
        return undefined;
    }

    if (sort?.key !== sortKeyOf(column)) {
        return 'none';
    }

    return sort.direction === 'asc' ? 'ascending' : 'descending';
}

function cellValue<Row>(
    column: DataTableColumn<Row>,
    row: Row,
    rowIndex: number,
): ReactNode {
    if (column.cell) {
        return column.cell(row, rowIndex);
    }

    const accessor = column.accessor ?? (column.key as keyof Row);

    return row[accessor] as ReactNode;
}

function SortIcon<Row>({
    column,
    sort,
}: {
    column: DataTableColumn<Row>;
    sort: DataTableSort | null | undefined;
}) {
    if (sort?.key !== sortKeyOf(column)) {
        return <ChevronsUpDown className="size-3.5 text-text-200" />;
    }

    return sort.direction === 'asc' ? (
        <ChevronUp className="size-3.5" />
    ) : (
        <ChevronDown className="size-3.5" />
    );
}

export function DataTableHeader<Row>({
    columns,
    sort,
    onSortChange,
    hasSelection,
    areAllSelected,
    hasSelectableRows,
    onSelectAll,
    hasActions,
    actionsHeader,
}: {
    columns: DataTableColumn<Row>[];
    sort?: DataTableSort | null;
    onSortChange?: (sort: DataTableSort | null) => void;
    hasSelection: boolean;
    areAllSelected: boolean;
    hasSelectableRows: boolean;
    onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
    hasActions: boolean;
    actionsHeader?: ReactNode;
}) {
    return (
        <TableHeader>
            <TableRow className="bg-background-soft-50 [&>th]:text-text-50">
                {hasSelection && (
                    <TableHead className="w-12">
                        <Checkbox
                            aria-label="Select all rows on this page"
                            checked={areAllSelected}
                            disabled={!hasSelectableRows}
                            onChange={onSelectAll}
                        />
                    </TableHead>
                )}

                {columns.map((column) => (
                    <TableHead
                        key={column.key}
                        aria-sort={ariaSortFor(column, sort)}
                        className={cn(
                            column.align && alignClasses[column.align],
                            column.headerClassName,
                        )}
                    >
                        {column.sortable ? (
                            <button
                                type="button"
                                onClick={() =>
                                    onSortChange?.(nextSortFor(column, sort))
                                }
                                className="inline-flex items-center gap-1 rounded hover:text-title-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
                            >
                                {column.header}
                                <SortIcon column={column} sort={sort} />
                            </button>
                        ) : (
                            column.header
                        )}
                    </TableHead>
                ))}

                {hasActions && (
                    <TableHead className="text-right">
                        {actionsHeader ?? (
                            <span className="sr-only">Actions</span>
                        )}
                    </TableHead>
                )}
            </TableRow>
        </TableHeader>
    );
}

/** Pulsing placeholder rows, shown while the first page loads. */
function LoadingRows<Row>({
    count,
    columns,
    hasSelection,
    hasActions,
}: {
    count: number;
    columns: DataTableColumn<Row>[];
    hasSelection: boolean;
    hasActions: boolean;
}) {
    return Array.from({ length: count }, (_, index) => (
        <TableRow key={`skeleton-${index}`}>
            {hasSelection && (
                <TableCell>
                    <div className="size-4 animate-pulse rounded bg-background-soft-200" />
                </TableCell>
            )}
            {columns.map((column) => (
                <TableCell key={column.key}>
                    <div className="h-4 w-full animate-pulse rounded bg-background-soft-200" />
                </TableCell>
            ))}
            {hasActions && (
                <TableCell>
                    <div className="ml-auto h-4 w-12 animate-pulse rounded bg-background-soft-200" />
                </TableCell>
            )}
        </TableRow>
    ));
}

function DataTableRow<Row>({
    row,
    rowIndex,
    rowId,
    columns,
    selection,
    onSelectRow,
    rowClassName,
    rowActions,
    can,
}: {
    row: Row;
    rowIndex: number;
    rowId: DataTableRowId;
    columns: DataTableColumn<Row>[];
    selection?: DataTableSelection<Row>;
    onSelectRow: (row: Row, checked: boolean) => void;
    rowClassName?: (row: Row) => string | undefined;
    rowActions?: (row: Row) => DataTableRowAction[];
    can?: (permission: string) => boolean;
}) {
    return (
        <TableRow
            className={cn(
                'text-sm hover:bg-background-soft-50',
                rowClassName?.(row),
            )}
        >
            {selection && (
                <TableCell>
                    <Checkbox
                        aria-label={`Select row ${String(rowId)}`}
                        checked={selection.selectedIds.has(rowId)}
                        disabled={selection.isRowDisabled?.(row)}
                        onChange={(event) =>
                            onSelectRow(row, event.target.checked)
                        }
                    />
                </TableCell>
            )}

            {columns.map((column) => (
                <TableCell
                    key={column.key}
                    className={cn(
                        column.align && alignClasses[column.align],
                        column.className,
                    )}
                >
                    {cellValue(column, row, rowIndex)}
                </TableCell>
            ))}

            {rowActions && (
                <TableCell className="text-right">
                    <RowActionsMenu
                        row={row}
                        rowId={rowId}
                        rowActions={rowActions}
                        can={can}
                    />
                </TableCell>
            )}
        </TableRow>
    );
}

export function DataTableBody<Row>({
    rows,
    getRowId,
    columns,
    columnCount,
    isLoading,
    loadingRowCount,
    emptyState,
    selection,
    onSelectRow,
    rowClassName,
    rowActions,
    can,
}: {
    rows: Row[];
    getRowId: (row: Row) => DataTableRowId;
    columns: DataTableColumn<Row>[];
    columnCount: number;
    isLoading: boolean;
    loadingRowCount: number;
    emptyState: ReactNode;
    selection?: DataTableSelection<Row>;
    onSelectRow: (row: Row, checked: boolean) => void;
    rowClassName?: (row: Row) => string | undefined;
    rowActions?: (row: Row) => DataTableRowAction[];
    can?: (permission: string) => boolean;
}) {
    return (
        <TableBody
            aria-busy={isLoading}
            className={cn(
                isRefreshingRows(isLoading, rows.length) &&
                    'opacity-50 transition-opacity',
            )}
        >
            {isInitialLoading(isLoading, rows.length) && (
                <LoadingRows
                    count={loadingRowCount}
                    columns={columns}
                    hasSelection={selection !== undefined}
                    hasActions={rowActions !== undefined}
                />
            )}

            {showsEmptyState(isLoading, rows.length) && (
                <TableRow>
                    <TableCell colSpan={columnCount} className="text-center">
                        {emptyState}
                    </TableCell>
                </TableRow>
            )}

            {rows.map((row, rowIndex) => {
                const rowId = getRowId(row);

                return (
                    <DataTableRow
                        key={rowId}
                        row={row}
                        rowIndex={rowIndex}
                        rowId={rowId}
                        columns={columns}
                        selection={selection}
                        onSelectRow={onSelectRow}
                        rowClassName={rowClassName}
                        rowActions={rowActions}
                        can={can}
                    />
                );
            })}
        </TableBody>
    );
}

function isInitialLoading(isLoading: boolean, rowCount: number): boolean {
    return isLoading && rowCount === 0;
}

/** Rows stay on screen and dim while the next page loads. */
function isRefreshingRows(isLoading: boolean, rowCount: number): boolean {
    return isLoading && rowCount > 0;
}

function showsEmptyState(isLoading: boolean, rowCount: number): boolean {
    return !isLoading && rowCount === 0;
}
