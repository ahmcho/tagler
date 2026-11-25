import { Filter, Search1 } from '@tailgrids/icons';
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    MoreHorizontal,
    MoreVertical,
} from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { Checkbox } from '@/components/tailgrids/core/checkbox';
import {
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/tailgrids/core/dropdown';
import { Input } from '@/components/tailgrids/core/input';
import { Pagination } from '@/components/tailgrids/core/pagination';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
import { TextField } from '@/components/tailgrids/core/text-field';
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
    summary?: ReactNode;
};

export type DataTableRowAction = {
    key: string;
    label: string;
    icon?: ReactNode;
    permission?: string;
    onAction: () => void;
    isDisabled?: boolean;
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
};

export type DataTableBulkAction = Omit<DataTableRowAction, 'onAction'> & {
    onAction: (selectedIds: ReadonlySet<DataTableRowId>) => void;
};

export type DataTableSearch = {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    placeholder?: string;
    label?: string;
};

export type DataTableFilter = {
    title?: string;
    description?: string;
    children: ReactNode;
    onApply: () => void;
    onReset: () => void;
    activeCount?: number;
};

export type DataTableProps<Row> = {
    columns: DataTableColumn<Row>[];
    rows: Row[];
    getRowId: (row: Row) => DataTableRowId;
    caption?: string;
    title?: ReactNode;
    subtitle?: ReactNode;
    search?: DataTableSearch;
    filter?: DataTableFilter;
    bulkActions?: DataTableBulkAction[];
    fullBleed?: boolean;
    className?: string;
    rowClassName?: (row: Row) => string | undefined;
    isLoading?: boolean;
    loadingRowCount?: number;
    emptyState?: ReactNode;
    sort?: DataTableSort | null;
    onSortChange?: (sort: DataTableSort | null) => void;
    selection?: DataTableSelection<Row>;
    rowActions?: (row: Row) => DataTableRowAction[];
    can?: (permission: string) => boolean;
    actionsHeader?: ReactNode;
    pagination?: DataTablePagination;
};

export type DataTableMenuItem = Pick<
    DataTableRowAction,
    'key' | 'label' | 'icon' | 'isDisabled' | 'tone'
> & {
    onAction: () => void;
};

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const;

const menuItemToneClasses = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-error-500',
};

export const menuContentClassName =
    'min-w-46 p-1 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]';

function isPermitted(
    item: { permission?: string },
    can?: (permission: string) => boolean,
): boolean {
    return !item.permission || !can || can(item.permission);
}

/** Adds or removes the given ids. Returns a new set. */
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

export function DataTableMenuItems({ items }: { items: DataTableMenuItem[] }) {
    return (
        <>
            {items.map((item) => (
                <DropdownMenuItem
                    key={item.key}
                    id={item.key}
                    textValue={item.label}
                    isDisabled={item.isDisabled}
                    onAction={item.onAction}
                    className={cn(
                        'cursor-pointer gap-3 rounded-lg px-3 py-2 data-disabled:cursor-not-allowed data-disabled:opacity-50',
                        item.tone &&
                            item.tone !== 'default' &&
                            menuItemToneClasses[item.tone],
                    )}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </DropdownMenuItem>
            ))}
        </>
    );
}

function DataTableHeading({
    title,
    subtitle,
}: {
    title: ReactNode;
    subtitle: ReactNode;
}) {
    return (
        <div className="min-w-0 break-words">
            {title !== undefined && (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h2>
            )}
            {subtitle !== undefined && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                </div>
            )}
        </div>
    );
}

function DataTableSearchForm({
    search,
    onSubmit,
}: {
    search: DataTableSearch;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <form
            role="search"
            onSubmit={onSubmit}
            className="relative w-full lg:w-72"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-text-100 [&>svg]:size-5"
            >
                <Search1 />
            </span>
            <TextField
                aria-label={search.label ?? 'Search'}
                value={search.value}
                onChange={search.onChange}
                className="w-full"
            >
                <Input
                    type="search"
                    placeholder={search.placeholder}
                    className="w-full pl-10"
                />
            </TextField>
        </form>
    );
}

/** The Filter button and its dialog. The open state belongs to the table. */
function DataTableFilterControl({
    filter,
    isOpen,
    onOpenChange,
}: {
    filter: DataTableFilter;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <>
            <Button appearance="outline" onPress={() => onOpenChange(true)}>
                <span
                    aria-hidden="true"
                    className="flex items-center [&>svg]:size-4"
                >
                    <Filter />
                </span>
                Filter
                {(filter.activeCount ?? 0) > 0 && (
                    <span className="rounded-full bg-primary-500 px-1.5 text-xs leading-5 font-medium text-white">
                        {filter.activeCount}
                    </span>
                )}
            </Button>

            <Dialog
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable
                className="flex max-h-[calc(100dvh-2rem)] flex-col"
            >
                <DialogHeader>
                    <DialogTitle>{filter.title ?? 'Filter'}</DialogTitle>
                    {filter.description && (
                        <DialogDescription>
                            {filter.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <DialogBody className="min-h-0 flex-1 overflow-y-auto">
                    {filter.children}
                </DialogBody>

                <DialogFooter>
                    <Button
                        appearance="outline"
                        onPress={() => {
                            filter.onReset();
                            onOpenChange(false);
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onPress={() => {
                            filter.onApply();
                            onOpenChange(false);
                        }}
                    >
                        Apply
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

/** The batch menu for the checked rows. Each action gets the selected ids. */
function DataTableBatchMenu<Row>({
    actions,
    selection,
}: {
    actions: DataTableBulkAction[];
    selection: DataTableSelection<Row>;
}) {
    const selectedCount = selection.selectedIds.size;

    return (
        <>
            {selectedCount > 0 && (
                <span className="text-sm text-text-100">
                    {selectedCount} selected
                </span>
            )}

            <DropdownMenu>
                <Button
                    aria-label="Batch actions"
                    appearance="outline"
                    iconOnly
                >
                    <MoreVertical className="size-5" />
                </Button>

                <DropdownMenuContent
                    placement="bottom end"
                    className={menuContentClassName}
                >
                    <DataTableMenuItems
                        items={actions.map((action) => ({
                            ...action,
                            isDisabled:
                                action.isDisabled || selectedCount === 0,
                            onAction: () =>
                                action.onAction(selection.selectedIds),
                        }))}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

type DataTableToolbarProps<Row> = {
    title: ReactNode;
    subtitle: ReactNode;
    search?: DataTableSearch;
    onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
    filter?: DataTableFilter;
    isFilterOpen: boolean;
    onFilterOpenChange: (open: boolean) => void;
    selection?: DataTableSelection<Row>;
    bulkActions: DataTableBulkAction[];
};

/** Heading, search, filter and batch menu. The row above the table. */
function DataTableToolbar<Row>({
    title,
    subtitle,
    search,
    onSearchSubmit,
    filter,
    isFilterOpen,
    onFilterOpenChange,
    selection,
    bulkActions,
}: DataTableToolbarProps<Row>) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {(title !== undefined || subtitle !== undefined) && (
                <DataTableHeading title={title} subtitle={subtitle} />
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 lg:ml-auto">
                {search && (
                    <DataTableSearchForm
                        search={search}
                        onSubmit={onSearchSubmit}
                    />
                )}

                {filter && (
                    <DataTableFilterControl
                        filter={filter}
                        isOpen={isFilterOpen}
                        onOpenChange={onFilterOpenChange}
                    />
                )}

                {selection && bulkActions.length > 0 && (
                    <DataTableBatchMenu
                        actions={bulkActions}
                        selection={selection}
                    />
                )}
            </div>
        </div>
    );
}

function RowActionsMenu<Row>({
    row,
    rowId,
    rowActions,
    can,
}: {
    row: Row;
    rowId: DataTableRowId;
    rowActions: (row: Row) => DataTableRowAction[];
    can?: (permission: string) => boolean;
}) {
    const actions = rowActions(row).filter((action) =>
        isPermitted(action, can),
    );

    if (actions.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <Button
                aria-label={`Actions for row ${String(rowId)}`}
                variant="ghost"
                iconOnly
            >
                <MoreHorizontal className="size-5" />
            </Button>

            <DropdownMenuContent
                placement="bottom end"
                className={menuContentClassName}
            >
                <DataTableMenuItems items={actions} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

type DataTableHeaderProps<Row> = {
    columns: DataTableColumn<Row>[];
    sort?: DataTableSort | null;
    onSortChange?: (sort: DataTableSort | null) => void;
    hasSelection: boolean;
    areAllSelected: boolean;
    hasSelectableRows: boolean;
    onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
    hasActions: boolean;
    actionsHeader?: ReactNode;
};

function DataTableHeader<Row>({
    columns,
    sort,
    onSortChange,
    hasSelection,
    areAllSelected,
    hasSelectableRows,
    onSelectAll,
    hasActions,
    actionsHeader,
}: DataTableHeaderProps<Row>) {
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

type DataTableRowProps<Row> = {
    row: Row;
    rowIndex: number;
    rowId: DataTableRowId;
    columns: DataTableColumn<Row>[];
    selection?: DataTableSelection<Row>;
    onSelectRow: (row: Row, checked: boolean) => void;
    rowClassName?: (row: Row) => string | undefined;
    rowActions?: (row: Row) => DataTableRowAction[];
    can?: (permission: string) => boolean;
};

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
}: DataTableRowProps<Row>) {
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

type DataTableBodyProps<Row> = {
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
};

function DataTableBody<Row>({
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
}: DataTableBodyProps<Row>) {
    const showSkeleton = isLoading && rows.length === 0;

    return (
        <TableBody
            aria-busy={isLoading}
            className={cn(
                isLoading && rows.length > 0 && 'opacity-50 transition-opacity',
            )}
        >
            {showSkeleton && (
                <LoadingRows
                    count={loadingRowCount}
                    columns={columns}
                    hasSelection={selection !== undefined}
                    hasActions={rowActions !== undefined}
                />
            )}

            {!isLoading && rows.length === 0 && (
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

/** True when the toolbar has something to show: a heading, search, filter or a visible batch action. */
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
    const columnCount =
        columns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);

    const selectableRows = selection
        ? rows.filter((row) => !selection.isRowDisabled?.(row))
        : [];
    const areAllSelected = areAllRowsSelected(
        selectableRows,
        selection,
        getRowId,
    );

    const visibleBulkActions = (bulkActions ?? []).filter((action) =>
        isPermitted(action, can),
    );
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
