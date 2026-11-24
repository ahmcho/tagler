import { FolderPlus, Trash2 } from 'lucide-react';
import { SelectField } from '@/components/select-field';
import { Button } from '@/components/tailgrids/core/button';
import type { MediaSort } from '../types';
import type { MediaUploadLimits, MediaFolderFilter } from '../types';
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

type Props = {
    search: string;
    sort: MediaSort;
    trashed: boolean;
    folder: MediaFolderFilter;
    limits: MediaUploadLimits;
    canUpload: boolean;
    canCreateFolder: boolean;
    onSearch: (search: string) => void;
    onSort: (sort: MediaSort) => void;
    onToggleTrash: () => void;
    onNewFolder: () => void;
    onUploaded: () => void;
};

export function MediaToolbar({
    search,
    sort,
    trashed,
    folder,
    limits,
    canUpload,
    canCreateFolder,
    onSearch,
    onSort,
    onToggleTrash,
    onNewFolder,
    onUploaded,
}: Props) {
    return (
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                <MediaTextField
                    ariaLabel="Search media"
                    placeholder="Search by name or title"
                    value={search}
                    onChange={onSearch}
                />
                <SelectField
                    label="Sort"
                    value={sort}
                    onChange={(value) => onSort(value as MediaSort)}
                    options={SORT_OPTIONS}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

                {canUpload && !trashed && (
                    <MediaUploadButton
                        limits={limits}
                        folder={folder}
                        onUploaded={onUploaded}
                    />
                )}
            </div>
        </div>
    );
}
