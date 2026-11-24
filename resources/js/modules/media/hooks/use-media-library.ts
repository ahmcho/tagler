import { useCallback, useEffect, useMemo, useState } from 'react';
import { mediaApi } from '../api/media-api';
import type {
    MediaFolder,
    MediaLibraryQuery,
    MediaRecord,
    MediaUsage,
    PaginatedMedia,
} from '../types';

export const DEFAULT_QUERY: MediaLibraryQuery = {
    category: null,
    search: '',
    folder: 'root',
    sort: 'created_desc',
    trashed: false,
    page: 1,
};

type FileState = { key: string; page: PaginatedMedia };

/**
 * Holds the library state for the manager. Files come from the JSON endpoints, not from Inertia
 * props, so a filter change does not reload the page. Each request result is tied to the query
 * it answers, so a slow older response never replaces a newer one.
 */
export function useMediaLibrary() {
    const [query, setQuery] = useState<MediaLibraryQuery>(DEFAULT_QUERY);
    const [fileState, setFileState] = useState<FileState | null>(null);
    const [folders, setFolders] = useState<MediaFolder[]>([]);
    const [usage, setUsage] = useState<MediaUsage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);

    const queryKey = useMemo(() => JSON.stringify(query), [query]);

    useEffect(() => {
        let active = true;

        mediaApi
            .listFiles(query)
            .then((page) => {
                if (active) {
                    setFileState({ key: queryKey, page });
                    setError(null);
                }
            })
            .catch((failure: unknown) => {
                if (active) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'The files could not be loaded.',
                    );
                }
            });

        return () => {
            active = false;
        };
    }, [query, queryKey, reloadCount]);

    useEffect(() => {
        let active = true;

        Promise.all([mediaApi.listFolders(), mediaApi.stats()])
            .then(([folderList, stats]) => {
                if (active) {
                    setFolders(folderList);
                    setUsage(stats);
                }
            })
            .catch(() => {
                if (active) {
                    setError('The library summary could not be loaded.');
                }
            });

        return () => {
            active = false;
        };
    }, [reloadCount]);

    /** Any filter change returns to page one. A page change passes `page` explicitly. */
    const update = useCallback((patch: Partial<MediaLibraryQuery>) => {
        setQuery((previous) => ({ ...previous, page: 1, ...patch }));
    }, []);

    /** Reloads the list and the summary, for example after an upload or a move. */
    const refresh = useCallback(() => setReloadCount((count) => count + 1), []);

    const replaceFile = useCallback((updated: MediaRecord) => {
        setFileState((previous) =>
            previous
                ? {
                      ...previous,
                      page: {
                          ...previous.page,
                          data: previous.page.data.map((file) =>
                              file.id === updated.id ? updated : file,
                          ),
                      },
                  }
                : previous,
        );
    }, []);

    const removeFile = useCallback((uuid: string) => {
        setFileState((previous) =>
            previous
                ? {
                      ...previous,
                      page: {
                          ...previous.page,
                          data: previous.page.data.filter(
                              (file) => file.id !== uuid,
                          ),
                      },
                  }
                : previous,
        );
    }, []);

    const current = fileState?.page ?? null;

    return {
        query,
        files: current,
        folders,
        usage,
        loading: fileState?.key !== queryKey,
        error,
        setError,
        update,
        refresh,
        replaceFile,
        removeFile,
    };
}
