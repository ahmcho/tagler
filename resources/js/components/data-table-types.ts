import type { ReactNode } from 'react';

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
