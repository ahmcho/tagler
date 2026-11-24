import { ArrowDownUp, FolderPlus, Search, Shapes, Trash2 } from 'lucide-react';
import { SelectField } from '@/components/select-field';
import { Button } from '@/components/tailgrids/core/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/tailgrids/core/input-group';
import { TextField } from '@/components/tailgrids/core/text-field';
import { MEDIA_CATEGORIES } from '../lib/format';
import type {
    MediaCategory,
    MediaFolderFilter,
    MediaSort,
    MediaUploadLimits,
} from '../types';
import { MediaUploadButton } from './media-upload-button';

export const SORT_OPTIONS: { value: MediaSort; label: string }[] = [
    { value: 'created_desc', label: 'Newest first' },
    { value: 'created_asc', label: 'Oldest first' },
    { value: 'name_asc', label: 'Name A to Z' },
    { value: 'name_desc', label: 'Name Z to A' },
    { value: 'size_desc', label: 'Largest first' },
    { value: 'size_asc', label: 'Smallest first' },
];

type SearchProps = {
    search: string;
    onSearch: (search: string) => void;
    onSubmit?: () => void;
};

/** Search field in an input group, 44px high and 300px wide, as in the design. */
export function MediaSearchField({ search, onSearch, onSubmit }: SearchProps) {
    return (
        <div className="w-full sm:w-[300px]">
            <TextField
                aria-label="Search"
                value={search}
                onChange={onSearch}
                className="w-full"
            >
                <InputGroup className="h-11">
                    <InputGroupAddon>
                        <Search className="size-5 text-text-100" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search..."
                        className="h-11"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && onSubmit) {
                                event.preventDefault();
                                onSubmit();
                            }
                        }}
                    />
                </InputGroup>
            </TextField>
        </div>
    );
}

type UploadProps = {
    limits: MediaUploadLimits;
    folder: MediaFolderFilter;
    canUpload: boolean;
    onUploaded: () => void;
};

/** Upload button, 44px high, as in the design. */
export function MediaUploadAction({
    limits,
    folder,
    canUpload,
    onUploaded,
}: UploadProps) {
    if (!canUpload) {
        return null;
    }

    return (
        <MediaUploadButton
            limits={limits}
            folder={folder}
            onUploaded={onUploaded}
        />
    );
}

type ToolsProps = {
    sort: MediaSort;
    category: MediaCategory | null;
    trashed: boolean;
    canCreateFolder: boolean;
    onSort: (sort: MediaSort) => void;
    onCategory: (category: MediaCategory | null) => void;
    onToggleTrash: () => void;
    onNewFolder: () => void;
};

/** Category, sort, trash and new folder for the library listing. Renders inline in the header row. */
export function MediaLibraryTools({
    sort,
    category,
    trashed,
    canCreateFolder,
    onSort,
    onCategory,
    onToggleTrash,
    onNewFolder,
}: ToolsProps) {
    return (
        <>
            <div className="w-44">
                <SelectField
                    label="Type"
                    hideLabel
                    startIcon={<Shapes className="size-5 text-text-100" />}
                    value={category ?? ''}
                    onChange={(value) =>
                        onCategory(
                            value === '' ? null : (value as MediaCategory),
                        )
                    }
                    options={MEDIA_CATEGORIES}
                    allOptionLabel="All types"
                />
            </div>
            <div className="w-52">
                <SelectField
                    label="Sort by"
                    hideLabel
                    startIcon={<ArrowDownUp className="size-5 text-text-100" />}
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
                className="h-11"
            >
                <Trash2 className="size-4" />
                {trashed ? 'Back to library' : 'Trash'}
            </Button>
            {canCreateFolder && !trashed && (
                <Button
                    variant="primary"
                    appearance="outline"
                    onPress={onNewFolder}
                    className="h-11"
                >
                    <FolderPlus className="size-4" />
                    New folder
                </Button>
            )}
        </>
    );
}
