import type { ReactNode } from 'react';
import type { DataTableRowId } from '@/components/data-table';
import type { SelectOption } from '@/components/searchable-list';
import type { SearchPage } from '@/hooks/use-search';

/** Query params the server shares as `filters`: the sort plus each filter and search value. */
export type ResourceQuery = {
    sort?: string;
    direction?: 'asc' | 'desc';
    [key: string]: string | number | undefined;
};

export type ResourcePagination = {
    currentPage: number;
    lastPage: number;
    total: number;
};

export type ResourceActionOptions = {
    /** Call when the request ends, on success or failure. The confirm dialog closes then, so errors show on the page. */
    onFinish: () => void;
};

export type ResourceConfirm<Target> = {
    title: string;
    description: (target: Target) => string;
    confirmLabel: string;
    icon: ReactNode;
    tone?: 'default' | 'danger';
};

export type ResourceRowAction<Row> = {
    key: string;
    label: string;
    icon?: ReactNode;
    permission?: string;
    tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    onAction: (row: Row, options: ResourceActionOptions) => void;
    confirm?: ResourceConfirm<Row>;
};

export type ResourceBulkAction = {
    key: string;
    label: string;
    icon?: ReactNode;
    permission?: string;
    onAction: (ids: DataTableRowId[], options: ResourceActionOptions) => void;
    confirm?: ResourceConfirm<DataTableRowId[]>;
};

type ResourceFilterBase = {
    name: string;
    label: string;
};

export type ResourceSelectFilter = ResourceFilterBase & {
    type: 'select';
    options: string[];
    allLabel?: string;
};

export type ResourceTextFilter = ResourceFilterBase & {
    type: 'text';
    inputMode?: 'text' | 'numeric';
};

export type ResourceSearchableFilter = ResourceFilterBase & {
    type: 'searchable';
    placeholder: string;
    loadingMessage: string;
    noOptionsMessage: string;
    loadOptions: (inputValue: string, page: number) => Promise<SearchPage>;
    initialOption: SelectOption | null;
};

export type ResourceFilterField =
    | ResourceSelectFilter
    | ResourceTextFilter
    | ResourceSearchableFilter;

export type ResourceFilters = {
    title: string;
    description: string;
    fields: ResourceFilterField[];
};

export type ResourceSearch = {
    /** Query param name, for example `key`. */
    name: string;
    label: string;
    placeholder: string;
};
