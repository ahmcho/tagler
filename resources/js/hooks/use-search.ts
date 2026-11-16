import { useHttp } from '@inertiajs/react';
import type { SelectOption } from '@/components/searchable-list';
import type { RouteDefinition, RouteQueryOptions } from '@/wayfinder';

type UseSearchOptions<TItem> = {
    /** Wayfinder route function for the search endpoint. */
    route: (options?: RouteQueryOptions) => RouteDefinition<'get'>;
    /** Maps one response item to the select's `{ value, label }` pair. */
    toOption: (item: TItem) => SelectOption;
};

type SearchResponse<TItem> = { data: TItem[]; has_more: boolean };

export type SearchPage = { options: SelectOption[]; hasMore: boolean };

/**
 * Fetches one page of a paginated search endpoint for a `SearchableList`.
 * The endpoint takes `q` for the search text and `page` for the page number.
 */
export function useSearch<TItem>({ route, toOption }: UseSearchOptions<TItem>) {
    const { submit } = useHttp();

    async function loadOptions(
        inputValue: string,
        page: number,
    ): Promise<SearchPage> {
        const response = (await submit(
            route({ query: { q: inputValue, page } }),
        )) as SearchResponse<TItem>;

        return {
            options: response.data.map(toOption),
            hasMore: response.has_more,
        };
    }

    return { loadOptions };
}
