import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { DataTableRowId, DataTableSort } from '@/components/data-table';
import type { SelectOption } from '@/components/searchable-list';
import type {
    ResourceFilterField,
    ResourceQuery,
    ResourceSearch,
} from './types';

type QueryValue = string | number | undefined;

type UseResourceIndexOptions = {
    indexUrl: string;
    /** Prop name of the rows. Reloaded with the page, together with `filters` and `status`. */
    dataKey: string;
    /** The server `filters` prop: the current sort, search and filter values. */
    query: ResourceQuery;
    fields: ResourceFilterField[];
    search?: ResourceSearch;
    defaultSortDirection?: 'asc' | 'desc';
};

function initialTextValues(
    fields: ResourceFilterField[],
    query: ResourceQuery,
): Record<string, string> {
    const values: Record<string, string> = {};

    for (const field of fields) {
        if (field.type !== 'searchable') {
            values[field.name] = String(query[field.name] ?? '');
        }
    }

    return values;
}

function initialOptionValues(
    fields: ResourceFilterField[],
): Record<string, SelectOption | null> {
    const values: Record<string, SelectOption | null> = {};

    for (const field of fields) {
        if (field.type === 'searchable') {
            values[field.name] = field.initialOption;
        }
    }

    return values;
}

/**
 * Owns the state and the Inertia requests of a list page: sort, page,
 * filter and search values, and the selected rows.
 */
export function useResourceIndex({
    indexUrl,
    dataKey,
    query,
    fields,
    search,
    defaultSortDirection = 'asc',
}: UseResourceIndexOptions) {
    const [textValues, setTextValues] = useState(() =>
        initialTextValues(fields, query),
    );
    const [optionValues, setOptionValues] = useState(() =>
        initialOptionValues(fields),
    );
    const [searchValue, setSearchValue] = useState(() =>
        search ? String(query[search.name] ?? '') : '',
    );
    const [selectedIds, setSelectedIds] = useState<Set<DataTableRowId>>(
        new Set(),
    );
    const [isLoading, setIsLoading] = useState(false);

    const visit = (params: Record<string, QueryValue>) => {
        router.get(indexUrl, params, {
            preserveState: true,
            preserveScroll: true,
            only: [dataKey, 'filters', 'status'],
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
            onSuccess: () => setSelectedIds(new Set()),
        });
    };

    const fieldQuery = (): Record<string, QueryValue> => {
        const params: Record<string, QueryValue> = {};

        for (const field of fields) {
            params[field.name] =
                field.type === 'searchable'
                    ? optionValues[field.name]?.value
                    : textValues[field.name] || undefined;
        }

        return params;
    };

    const searchQuery = (): Record<string, QueryValue> =>
        search ? { [search.name]: searchValue || undefined } : {};

    const applyFilters = () =>
        visit({
            ...fieldQuery(),
            ...searchQuery(),
            sort: query.sort,
            direction: query.direction,
        });

    const resetFilters = () => {
        const clearedTextValues: Record<string, string> = {};
        const clearedOptionValues: Record<string, SelectOption | null> = {};

        for (const field of fields) {
            if (field.type === 'searchable') {
                clearedOptionValues[field.name] = null;
            } else {
                clearedTextValues[field.name] = '';
            }
        }

        setTextValues(clearedTextValues);
        setOptionValues(clearedOptionValues);
        visit({
            ...searchQuery(),
            sort: query.sort,
            direction: query.direction,
        });
    };

    const changeSort = (sort: DataTableSort | null) =>
        visit({ ...query, sort: sort?.key, direction: sort?.direction });

    const changePage = (page: number) => visit({ ...query, page });

    const sort: DataTableSort | null = query.sort
        ? {
              key: query.sort,
              direction: query.direction ?? defaultSortDirection,
          }
        : null;

    const activeFilterCount = fields.filter(
        (field) => query[field.name] !== undefined && query[field.name] !== '',
    ).length;

    return {
        textValues,
        setTextValue: (name: string, value: string) =>
            setTextValues((current) => ({ ...current, [name]: value })),
        optionValues,
        setOptionValue: (name: string, option: SelectOption | null) =>
            setOptionValues((current) => ({ ...current, [name]: option })),
        searchValue,
        setSearchValue,
        selectedIds,
        setSelectedIds,
        clearSelection: () => setSelectedIds(new Set()),
        isLoading,
        sort,
        changeSort,
        changePage,
        applyFilters,
        resetFilters,
        activeFilterCount,
    };
}
