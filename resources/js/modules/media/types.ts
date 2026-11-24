export type MediaCategory =
    | 'pictures'
    | 'videos'
    | 'audio'
    | 'documents'
    | 'other';

export type MediaVisibility = 'public' | 'private';

export type MediaProcessingStatus =
    | 'pending'
    | 'processing'
    | 'ready'
    | 'failed';

export type MediaRecord = {
    id: string;
    name: string;
    mime_type: string;
    extension: string;
    size: number;
    category: MediaCategory;
    title: string | null;
    alt_text: string | null;
    description: string | null;
    folder_id: number | null;
    visibility: MediaVisibility;
    processing_status: MediaProcessingStatus;
    processing_error: string | null;
    dimensions?: { width: number; height: number };
    url: string | null;
    download_url: string;
    thumbnail_url: string | null;
    uploaded_by: { id: number; name: string } | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
};

export type MediaFolder = {
    id: number;
    name: string;
    parent_id: number | null;
    created_at: string | null;
};

export type MediaUsage = {
    files: number;
    bytes: number;
    categories: Partial<
        Record<MediaCategory, { files: number; bytes: number }>
    >;
    quota_bytes: number | null;
};

export type PaginatedMedia = {
    data: MediaRecord[];
    meta: { current_page: number; last_page: number; total: number };
};

/** `root` is the top level, where files have no folder. */
export type MediaFolderFilter = 'root' | number;

export type MediaLibraryQuery = {
    category: MediaCategory | null;
    search: string;
    folder: MediaFolderFilter;
    sort: MediaSort;
    trashed: boolean;
    page: number;
};

export type MediaSort =
    | 'created_desc'
    | 'created_asc'
    | 'name_asc'
    | 'name_desc'
    | 'size_desc'
    | 'size_asc';

export type MediaUploadLimits = {
    maxKilobytes: number;
    accept: string[];
};
