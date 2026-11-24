import { FolderPlus, Search, Trash2 } from 'lucide-react';
import { SelectField } from '@/components/select-field';
import { Button } from '@/components/tailgrids/core/button';
import type { MediaFolderFilter, MediaSort, MediaUploadLimits } from '../types';
import { MediaTextField } from './media-text-field';
import { MediaUploadButton } from './media-upload-button';

export const SORT_OPTIONS: { value: MediaSort; label: string }[] = [
    { value: 'created_desc', label: 'Newest first' },
    { value: 'created_asc', label: 'Oldest first' },
    { value: 'name_asc', label: 'Name A to Z' },
    { value: 'name_desc', label: 'Name Z to A' },
    { value: 'size_desc', label: 'Largest first' },
    { value: 'size_asc', label: 'Smallest first' },
];

type HeaderProps = {
    search: string;
    folder: MediaFolderFilter;
    limits: MediaUploadLimits;
    canUpload: boolean;
    onSearch: (search: string) => void;
    onUploaded: () => void;
};

/** Search and upload, in the header of the All Media card. */
export function MediaHeaderActions({
    search,
    folder,
    limits,
    canUpload,
    onSearch,
    onUploaded,
}: HeaderProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-72">
                <MediaTextField
                    ariaLabel="Search media"
                    placeholder="Search..."
                    value={search}
                    onChange={onSearch}
                    startIcon={<Search className="size-4 text-text-100" />}
                />
            </div>
            {canUpload && (
                <MediaUploadButton
                    limits={limits}
                    folder={folder}
                    onUploaded={onUploaded}
                />
            )}
        </div>
    );
}

type FileToolsProps = {
    sort: MediaSort;
    trashed: boolean;
    canCreateFolder: boolean;
    onSort: (sort: MediaSort) => void;
    onToggleTrash: () => void;
    onNewFolder: () => void;
};

/** Sort, trash and new folder, in the Files card header. */
export function MediaFileTools({
    sort,
    trashed,
    canCreateFolder,
    onSort,
    onToggleTrash,
    onNewFolder,
}: FileToolsProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="w-56">
                <SelectField
                    label="Sort by"
                    value={sort}
                    onChange={(value) => onSort(value as MediaSort)}
                    options={SORT_OPTIONS}
                />
            </div>
            <Button
                variant="primary"
                appearance={trashed ? 'fill' : 'outline'}
                onPress={onToggleTrash}
                aria-pressed={trashed}
            >
                <Trash2 className="size-4" />
                {trashed ? 'Back to library' : 'Trash'}
            </Button>
            {canCreateFolder && !trashed && (
                <Button
                    variant="primary"
                    appearance="outline"
                    onPress={onNewFolder}
                >
                    <FolderPlus className="size-4" />
                    New folder
                </Button>
            )}
        </div>
    );
}
