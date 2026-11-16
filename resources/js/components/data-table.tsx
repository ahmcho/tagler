import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import { Pagination } from '@/components/tailgrids/core/pagination';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { cn } from '@/utils/cn';

export type DataTableRowId = string | number;

export type DataTableSort = {
    key: string;
    direction: 'asc' | 'desc';
};

export type DataTableColumn<Row> = {
    key: string;
    header: ReactNode;
    accessor?: keyof Row;
    cell?: (row: Row, rowIndex: number) => ReactNode;
    sortable?: boolean;
    sortKey?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    headerClassName?: string;
};

export type DataTableSelection<Row> = {
    selectedIds: ReadonlySet<DataTableRowId>;
    onChange: (selectedIds: Set<DataTableRowId>) => void;
    isRowDisabled?: (row: Row) => boolean;
};

export type DataTablePagination = {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    variant?: 'default' | 'compact';
};

export type DataTableProps<Row> = {
    columns: DataTableColumn<Row>[];
    rows: Row[];
    getRowId: (row: Row) => DataTableRowId;
    caption?: string;
    fullBleed?: boolean;
    className?: string;
    rowClassName?: (row: Row) => string | undefined;
    isLoading?: boolean;
    loadingRowCount?: number;
    emptyState?: ReactNode;
    sort?: DataTableSort | null;
    onSortChange?: (sort: DataTableSort | null) => void;
    selection?: DataTableSelection<Row>;
    rowActions?: (row: Row) => ReactNode;
    actionsHeader?: ReactNode;
    pagination?: DataTablePagination;
};

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const;

export function DataTable<Row>({
    columns,
    rows,
    getRowId,
    caption,
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
    actionsHeader,
    pagination,
}: DataTableProps<Row>) {
    const hasSelection = selection !== undefined;
    const hasActions = rowActions !== undefined;
    const columnCount =
        columns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);

    const selectableRows = selection
        ? rows.filter((row) => !selection.isRowDisabled?.(row))
        : [];
    const areAllSelected =
        selection !== undefined &&
        selectableRows.length > 0 &&
        selectableRows.every((row) => selection.selectedIds.has(getRowId(row)));

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
        if (!selection) {
            return;
        }

        const nextSelectedIds = new Set(selection.selectedIds);

        selectableRows.forEach((row) => {
            const rowId = getRowId(row);

            if (event.target.checked) {
                nextSelectedIds.add(rowId);
            } else {
                nextSelectedIds.delete(rowId);
            }
        });

        selection.onChange(nextSelectedIds);
    };

    const handleSelectRow = (row: Row, checked: boolean) => {
        if (!selection) {
            return;
        }

        const nextSelectedIds = new Set(selection.selectedIds);
        const rowId = getRowId(row);

        if (checked) {
            nextSelectedIds.add(rowId);
        } else {
            nextSelectedIds.delete(rowId);
        }

        selection.onChange(nextSelectedIds);
    };

    const getNextSort = (
        column: DataTableColumn<Row>,
    ): DataTableSort | null => {
        const sortKey = column.sortKey ?? column.key;

        if (sort?.key !== sortKey) {
            return { key: sortKey, direction: 'asc' };
        }

        if (sort.direction === 'asc') {
            return { key: sortKey, direction: 'desc' };
        }

        return null;
    };

    const getAriaSort = (
        column: DataTableColumn<Row>,
    ): 'ascending' | 'descending' | 'none' | undefined => {
        if (!column.sortable) {
            return undefined;
        }

        const sortKey = column.sortKey ?? column.key;

        if (sort?.key !== sortKey) {
            return 'none';
        }

        return sort.direction === 'asc' ? 'ascending' : 'descending';
    };

    const renderSortIcon = (column: DataTableColumn<Row>) => {
        const sortKey = column.sortKey ?? column.key;

        if (sort?.key !== sortKey) {
            return <ChevronsUpDown className="size-3.5 text-text-200" />;
        }

        return sort.direction === 'asc' ? (
            <ChevronUp className="size-3.5" />
        ) : (
            <ChevronDown className="size-3.5" />
        );
    };

    const renderCellValue = (
        column: DataTableColumn<Row>,
        row: Row,
        rowIndex: number,
    ): ReactNode => {
        if (column.cell) {
            return column.cell(row, rowIndex);
        }

        const accessor = column.accessor ?? (column.key as keyof Row);

        return row[accessor] as ReactNode;
    };

    return (
        <div className={cn('space-y-6', className)}>
            <TableRoot aria-label={caption} fullBleed={fullBleed}>
                <TableHeader>
                    <TableRow className="bg-background-soft-50 [&>th]:text-text-50">
                        {hasSelection && (
                            <TableHead className="w-12">
                                <Checkbox
                                    aria-label="Select all rows on this page"
                                    checked={areAllSelected}
                                    disabled={selectableRows.length === 0}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                        )}

                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                aria-sort={getAriaSort(column)}
                                className={cn(
                                    column.align && alignClasses[column.align],
                                    column.headerClassName,
                                )}
                            >
                                {column.sortable ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onSortChange?.(getNextSort(column))
                                        }
                                        className="inline-flex items-center gap-1 rounded hover:text-title-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:outline-none"
                                    >
                                        {column.header}
                                        {renderSortIcon(column)}
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

                <TableBody
                    aria-busy={isLoading}
                    className={cn(
                        isLoading &&
                            rows.length > 0 &&
                            'opacity-50 transition-opacity',
                    )}
                >
                    {isLoading &&
                        rows.length === 0 &&
                        Array.from({ length: loadingRowCount }, (_, index) => (
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
                        ))}

                    {!isLoading && rows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columnCount}
                                className="text-center"
                            >
                                {emptyState}
                            </TableCell>
                        </TableRow>
                    )}

                    {rows.map((row, rowIndex) => {
                        const rowId = getRowId(row);

                        return (
                            <TableRow
                                key={rowId}
                                className={cn(
                                    'text-sm hover:bg-background-soft-50',
                                    rowClassName?.(row),
                                )}
                            >
                                {selection && (
                                    <TableCell>
                                        <Checkbox
                                            aria-label={`Select row ${String(rowId)}`}
                                            checked={selection.selectedIds.has(
                                                rowId,
                                            )}
                                            disabled={selection.isRowDisabled?.(
                                                row,
                                            )}
                                            onChange={(event) =>
                                                handleSelectRow(
                                                    row,
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                    </TableCell>
                                )}

                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        className={cn(
                                            column.align &&
                                                alignClasses[column.align],
                                            column.className,
                                        )}
                                    >
                                        {renderCellValue(column, row, rowIndex)}
                                    </TableCell>
                                ))}

                                {rowActions && (
                                    <TableCell className="text-right">
                                        {rowActions(row)}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </TableRoot>

            {pagination && pagination.lastPage > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.lastPage}
                        onPageChange={pagination.onPageChange}
                        variant={pagination.variant}
                    />
                </div>
            )}
        </div>
    );
}
