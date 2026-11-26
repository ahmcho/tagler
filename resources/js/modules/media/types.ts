export type BadgeColor =
    | 'gray'
    | 'primary'
    | 'error'
    | 'warning'
    | 'success'
    | 'cyan'
    | 'sky'
    | 'blue'
    | 'violet'
    | 'purple'
    | 'pink'
    | 'rose'
    | 'orange';

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
    /** Lucide icon name for the MIME type. */
    mime_icon: string;
    extension: string;
    size: number;
    category: MediaCategory;
    title: string | null;
    alt_text: string | null;
    description: string | null;
    folder_id: number | null;
    visibility: MediaVisibility;
    /** Lifetime of signed links in minutes. Null uses the global setting. */
    link_ttl_minutes: number | null;
    processing_status: MediaProcessingStatus;
    /** Badge color for the processing status. */
    processing_color: BadgeColor;
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
    files_count: number;
    bytes: number;
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

/** `root` is the top level, where files have no folder. `all` ignores the folder. */
export type MediaFolderFilter = 'root' | 'all' | number;

export type MediaLibraryQuery = {
    category: MediaCategory | null;
    visibility?: MediaVisibility | null;
    search: string;
    folder: MediaFolderFilter;
    sort: MediaSort;
    trashed: boolean;
    page: number;
    perPage: number;
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
