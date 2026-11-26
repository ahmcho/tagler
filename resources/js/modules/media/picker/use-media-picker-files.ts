import { useEffect, useState } from 'react';
import { mediaApi } from '../api/media-api';
import type { MediaCategory, MediaFolderFilter, MediaRecord } from '../types';

export type PickerFilters = {
    category: MediaCategory | null;
    search: string;
    folder: MediaFolderFilter;
};

type Loaded = {
    key: string;
    page: number;
    files: MediaRecord[];
    lastPage: number;
    error: string | null;
};

const PER_PAGE = 40;

/**
 * Loads the picker's files one page at a time. A filter change starts again at page 1.
 * A reply for an older filter or page is ignored, so a slow request cannot replace a newer one.
 */
export function useMediaPickerFiles(filters: PickerFilters) {
    const filterKey = JSON.stringify(filters);
    const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
    const [reloads, setReloads] = useState(0);
    const [loaded, setLoaded] = useState<Loaded | null>(null);
    const page = pageState.key === filterKey ? pageState.page : 1;

    useEffect(() => {
        let active = true;

        mediaApi
            .listFiles({
                ...(JSON.parse(filterKey) as PickerFilters),
                visibility: 'public',
                sort: 'created_desc',
                trashed: false,
                page,
                perPage: PER_PAGE,
            })
            .then((response) => {
                if (!active) {
                    return;
                }

                setLoaded((previous) => ({
                    key: filterKey,
                    page,
                    files:
                        page > 1 && previous?.key === filterKey
                            ? [...previous.files, ...response.data]
                            : response.data,
                    lastPage: response.meta.last_page,
                    error: null,
                }));
            })
            .catch((failure: unknown) => {
                if (!active) {
                    return;
                }

                setLoaded((previous) => ({
                    key: filterKey,
                    page,
                    files: previous?.key === filterKey ? previous.files : [],
                    lastPage: page,
                    error:
                        failure instanceof Error
                            ? failure.message
                            : 'The files could not be loaded.',
                }));
            });

        return () => {
            active = false;
        };
    }, [filterKey, page, reloads]);

    const current = loaded?.key === filterKey ? loaded : null;
    const isCurrentPage = current !== null && current.page === page;

    return {
        files: current?.files ?? [],
        error: current?.error ?? null,
        loading: !isCurrentPage,
        hasMore: isCurrentPage && page < (current?.lastPage ?? 0),
        loadMore: () => setPageState({ key: filterKey, page: page + 1 }),
        reload: () => {
            setPageState({ key: filterKey, page: 1 });
            setReloads((count) => count + 1);
        },
    };
}
