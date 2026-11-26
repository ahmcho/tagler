import * as mediaFiles from '@/actions/App/Modules/Media/Controllers/MediaController';
import * as mediaFolders from '@/actions/App/Modules/Media/Controllers/MediaFolderController';
import { library as mediaLibrary } from '@/routes/media';
import type {
    MediaFolder,
    MediaLibraryQuery,
    MediaRecord,
    MediaUsage,
    MediaVisibility,
    PaginatedMedia,
} from '../types';

/** Validation or server error, with the field messages the server returned. */
export class MediaApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly errors: Record<string, string[]> = {},
    ) {
        super(message);
    }
}

type Json = Record<string, unknown>;

function csrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function readError(response: Response): Promise<MediaApiError> {
    const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Record<string, string[]>;
    };

    return new MediaApiError(
        body.message ?? `Request failed (${response.status}).`,
        response.status,
        body.errors ?? {},
    );
}

async function request<T>(
    url: string,
    method: string,
    body?: Json | FormData,
): Promise<T> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-XSRF-TOKEN': csrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
    };

    let payload: BodyInit | undefined;

    if (body instanceof FormData) {
        payload = body;
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }

    const response = await fetch(url, {
        method,
        headers,
        body: payload,
        credentials: 'same-origin',
    });

    if (!response.ok) {
        throw await readError(response);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

function withQuery(
    url: string,
    params: Record<string, string | number | boolean | null>,
): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== false) {
            search.set(key, String(value));
        }
    });

    const query = search.toString();

    return query ? `${url}?${query}` : url;
}

export function libraryUrl(query: MediaLibraryQuery): string {
    return withQuery(mediaFiles.index.url(), {
        category: query.category,
        visibility: query.visibility ?? null,
        search: query.search.trim(),
        folder: query.folder === 'all' ? null : query.folder,
        sort: query.sort,
        trashed: query.trashed ? 1 : null,
        page: query.page,
        per_page: query.perPage,
    });
}

/** The full library page, opened in a new tab from the dashboard. */
export function libraryPageUrl(
    params: { folder?: number; search?: string } = {},
): string {
    return withQuery(mediaLibrary.url(), {
        folder: params.folder ?? null,
        search: params.search?.trim() ?? null,
    });
}

export const mediaApi = {
    listFiles: (query: MediaLibraryQuery) =>
        request<PaginatedMedia>(libraryUrl(query), 'GET'),

    stats: () =>
        request<{ data: MediaUsage }>(mediaFiles.stats.url(), 'GET').then(
            (body) => body.data,
        ),

    listFolders: () =>
        request<{ data: MediaFolder[] }>(mediaFolders.index.url(), 'GET').then(
            (body) => body.data,
        ),

    createFolder: (name: string, parentId: number | null) =>
        request<{ data: MediaFolder }>(mediaFolders.store.url(), 'POST', {
            name,
            parent_id: parentId,
        }).then((body) => body.data),

    renameFolder: (id: number, name: string) =>
        request<{ data: MediaFolder }>(
            mediaFolders.update.url({ folder: id }),
            'PATCH',
            { name },
        ).then((body) => body.data),

    moveFolder: (id: number, parentId: number | null) =>
        request<{ data: MediaFolder }>(
            mediaFolders.move.url({ folder: id }),
            'POST',
            {
                parent_id: parentId,
            },
        ).then((body) => body.data),

    deleteFolder: (id: number) =>
        request<void>(mediaFolders.destroy.url({ folder: id }), 'DELETE'),

    updateFile: (
        uuid: string,
        payload: Partial<
            Pick<
                MediaRecord,
                'title' | 'alt_text' | 'description' | 'link_ttl_minutes'
            >
        >,
    ) =>
        request<{ data: MediaRecord }>(
            mediaFiles.update.url({ file: uuid }),
            'PATCH',
            payload,
        ).then((body) => body.data),

    moveFile: (uuid: string, folderId: number | null) =>
        request<{ data: MediaRecord }>(
            mediaFiles.move.url({ file: uuid }),
            'POST',
            {
                folder_id: folderId,
            },
        ).then((body) => body.data),

    changeVisibility: (uuid: string, visibility: MediaVisibility) =>
        request<{ data: MediaRecord }>(
            mediaFiles.visibility.url({ file: uuid }),
            'POST',
            {
                visibility,
            },
        ).then((body) => body.data),

    trashFile: (uuid: string, force = false) =>
        request<void>(
            mediaFiles.destroy.url({ file: uuid }),
            'DELETE',
            force ? { force: true } : undefined,
        ),

    restoreFile: (uuid: string) =>
        request<{ data: MediaRecord }>(
            mediaFiles.restore.url({ file: uuid }),
            'POST',
        ).then((body) => body.data),

    purgeFile: (uuid: string) =>
        request<void>(mediaFiles.purge.url({ file: uuid }), 'POST', {
            force: true,
        }),

    showFile: (uuid: string) =>
        request<{ data: MediaRecord }>(
            mediaFiles.show.url({ file: uuid }),
            'GET',
        ).then((body) => body.data),

    fileUrl: (uuid: string) =>
        request<{ url: string; temporary: boolean }>(
            mediaFiles.url.url({ file: uuid }),
            'GET',
        ),

    /**
     * Uploads one file and reports progress from 0 to 100. Uses XHR because fetch has no upload progress.
     */
    uploadFile: (
        file: File,
        fields: { folder_id: number | null; visibility: MediaVisibility },
        onProgress: (percent: number) => void,
    ): Promise<MediaRecord> =>
        new Promise((resolve, reject) => {
            const form = new FormData();
            form.append('file', file);

            if (fields.folder_id !== null) {
                form.append('folder_id', String(fields.folder_id));
            }

            form.append('visibility', fields.visibility);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', mediaFiles.store.url());
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('X-XSRF-TOKEN', csrfToken());
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    onProgress(Math.round((event.loaded / event.total) * 100));
                }
            };

            xhr.onload = () => {
                const body = JSON.parse(xhr.responseText || '{}') as {
                    data?: MediaRecord;
                    message?: string;
                    errors?: Record<string, string[]>;
                };

                if (xhr.status === 201 && body.data) {
                    resolve(body.data);

                    return;
                }

                reject(
                    new MediaApiError(
                        body.message ?? `Upload failed (${xhr.status}).`,
                        xhr.status,
                        body.errors ?? {},
                    ),
                );
            };

            xhr.onerror = () =>
                reject(
                    new MediaApiError(
                        'The upload could not reach the server.',
                        0,
                    ),
                );
            xhr.send(form);
        }),
};
