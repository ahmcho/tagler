import { Check, FolderPlus, Home, Search1 } from '@tailgrids/icons';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import {
    Alert,
    AlertContent,
    AlertDescription,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs';
import { Button } from '@/components/tailgrids/core/button';
import {
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/tailgrids/core/input-group';
import {
    ScrollArea,
    ScrollAreaViewport,
    ScrollBar,
} from '@/components/tailgrids/core/scroll-area';
import { Spinner } from '@/components/tailgrids/core/spinner';
import { TabList, TabRoot, TabTrigger } from '@/components/tailgrids/core/tabs';
import { mediaApi, MediaApiError } from '../api/media-api';
import { MediaFolderDialog } from '../components/media-folder-dialog';
import type { MediaCategory, MediaFolder, MediaRecord } from '../types';
import { matchesAccept, parseAccept } from './accept';
import { folderTrail } from './folder-tree';
import { MediaPickerFileGrid } from './media-picker-file-grid';
import { MediaPickerFolderSidebar } from './media-picker-folder-sidebar';
import { MediaPickerUploadArea } from './media-picker-upload';
import { useMediaPickerFiles } from './use-media-picker-files';

export type MediaLibraryPickerProps = {
    open: boolean;
    onClose: () => void;
    /** Receives the chosen file's uuid, a plain string. */
    onSelect: (uuid: string) => void;
    /** MIME patterns that can be chosen, e.g. "image/*". Leave out to allow every file. */
    accept?: string;
};

const CATEGORY_TABS: { value: 'all' | MediaCategory; label: string }[] = [
    { value: 'all', label: 'All files' },
    { value: 'pictures', label: 'Images' },
    { value: 'documents', label: 'Documents' },
    { value: 'audio', label: 'Audio' },
    { value: 'videos', label: 'Video' },
];

/** Modal that browses the media library and returns one file's uuid through `onSelect`. */
export function MediaLibraryPicker({
    open,
    onClose,
    onSelect,
    accept,
}: MediaLibraryPickerProps) {
    return (
        <Dialog
            isOpen={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    onClose();
                }
            }}
            className="flex max-h-[calc(100dvh-2rem)] max-w-5xl flex-col"
        >
            {/* Mounted only while open, so the selection and filters reset on every open. */}
            <PickerContent
                onClose={onClose}
                onSelect={onSelect}
                accept={accept}
            />
        </Dialog>
    );
}

function PickerContent({
    onClose,
    onSelect,
    accept,
}: Omit<MediaLibraryPickerProps, 'open'>) {
    const acceptPatterns = parseAccept(accept);

    const [folders, setFolders] = useState<MediaFolder[]>([]);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [folderId, setFolderId] = useState<number | null>(null);
    const [category, setCategory] = useState<'all' | MediaCategory>('all');
    const [tabsKey, setTabsKey] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MediaRecord | null>(null);
    const [upload, setUpload] = useState<{
        name: string;
        progress: number;
    } | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [creatingFolder, setCreatingFolder] = useState(false);

    const files = useMediaPickerFiles({
        category: category === 'all' ? null : category,
        search,
        folder: folderId ?? 'root',
    });

    useEffect(() => {
        let active = true;

        mediaApi
            .listFolders()
            .then((list) => {
                if (active) {
                    setFolders(list);
                }
            })
            .catch(() => {
                if (active) {
                    setUploadError('The folders could not be loaded.');
                }
            })
            .finally(() => {
                if (active) {
                    setFoldersLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(
            () => setSearch(searchInput.trim()),
            300,
        );

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const trail = folderTrail(folders, folderId);
    const folderName = trail.at(-1)?.name ?? 'Media library';
    const crumbs = [
        { href: '#media-root', label: 'Media library', icon: <Home /> },
        ...trail.map((folder) => ({
            href: `#media-folder-${folder.id}`,
            label: folder.name,
        })),
    ];

    function handleBreadcrumbClick(event: MouseEvent<HTMLElement>) {
        const href =
            (event.target as HTMLElement).closest('a')?.getAttribute('href') ??
            '';

        if (!href.startsWith('#media-')) {
            return;
        }

        event.preventDefault();
        setFolderId(
            href === '#media-root'
                ? null
                : Number(href.replace('#media-folder-', '')),
        );
    }

    async function handleUpload(file: File) {
        if (!matchesAccept(file.type, acceptPatterns)) {
            setUploadError(`“${file.name}” is not an accepted file type.`);

            return;
        }

        setUploadError(null);
        setUpload({ name: file.name, progress: 0 });

        try {
            const record = await mediaApi.uploadFile(
                file,
                { folder_id: folderId, visibility: 'public' },
                (progress) => setUpload({ name: file.name, progress }),
            );

            // Show the new file: clear the filters, then select it.
            setCategory('all');
            setTabsKey((key) => key + 1);
            setSearchInput('');
            setSearch('');
            setSelected(record);
            files.reload();
        } catch (failure) {
            setUploadError(
                failure instanceof MediaApiError
                    ? (failure.errors.file?.[0] ?? failure.message)
                    : 'The file could not be uploaded.',
            );
        } finally {
            setUpload(null);
        }
    }

    async function createFolder(name: string) {
        const folder = await mediaApi.createFolder(name, folderId);

        setFolders((list) => [...list, folder]);
        setFolderId(folder.id);
        setCreatingFolder(false);
    }

    function confirm() {
        if (selected) {
            onSelect(selected.id);
            onClose();
        }
    }

    const message = uploadError ?? files.error;

    return (
        <>
            <DialogHeader>
                <DialogTitle>Media library</DialogTitle>
                <DialogDescription>
                    Choose a file, or upload a new one to the folder you are in.
                </DialogDescription>
            </DialogHeader>

            <DialogBody className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <nav
                        aria-label="Current folder"
                        onClickCapture={handleBreadcrumbClick}
                        className="min-w-0"
                    >
                        <Breadcrumbs items={crumbs} dividerType="chevron" />
                    </nav>
                    <div className="flex items-center gap-2">
                        <InputGroup className="sm:w-64">
                            <InputGroupAddon>
                                {searchInput && files.loading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <Search1 className="size-4 text-text-100" />
                                )}
                            </InputGroupAddon>
                            <InputGroupInput
                                aria-label="Search files"
                                placeholder="Search by filename"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                            />
                        </InputGroup>
                        <Button
                            variant="primary"
                            appearance="outline"
                            onPress={() => setCreatingFolder(true)}
                        >
                            <FolderPlus />
                            New folder
                        </Button>
                    </div>
                </div>

                <TabRoot
                    key={tabsKey}
                    defaultValue="all"
                    variant="minimal"
                    className="border-0 p-0"
                >
                    <TabList>
                        {CATEGORY_TABS.map((tab) => (
                            <TabTrigger
                                key={tab.value}
                                value={tab.value}
                                onClick={() => setCategory(tab.value)}
                            >
                                {tab.label}
                            </TabTrigger>
                        ))}
                    </TabList>
                </TabRoot>

                <MediaPickerUploadArea
                    acceptPatterns={acceptPatterns}
                    folderName={folderName}
                    progress={upload}
                    onFile={handleUpload}
                />

                {message && (
                    <Alert status="error" className="max-w-none">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </AlertContent>
                    </Alert>
                )}

                <div className="flex min-h-64 flex-1 flex-col gap-4 md:flex-row">
                    <MediaPickerFolderSidebar
                        folders={folders}
                        loading={foldersLoading}
                        activeId={folderId}
                        onSelect={setFolderId}
                    />

                    <ScrollArea className="h-full min-w-0 flex-1">
                        <ScrollAreaViewport>
                            <div className="p-1">
                                <MediaPickerFileGrid
                                    files={files.files}
                                    loading={files.loading}
                                    acceptPatterns={acceptPatterns}
                                    selectedId={selected?.id ?? null}
                                    emptyText={
                                        search
                                            ? `No files match “${search}”.`
                                            : 'No files here yet. Upload one above.'
                                    }
                                    onSelect={setSelected}
                                />
                                {files.hasMore && (
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            variant="primary"
                                            appearance="outline"
                                            disabled={files.loading}
                                            onPress={files.loadMore}
                                        >
                                            Load more
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </ScrollAreaViewport>
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </div>
            </DialogBody>

            {creatingFolder && (
                <MediaFolderDialog
                    title="Create folder"
                    submitLabel="Create"
                    initialName=""
                    onSubmit={createFolder}
                    onClose={() => setCreatingFolder(false)}
                />
            )}

            <DialogFooter className="items-stretch">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-text-100">
                        {selected ? (
                            <>
                                <Check className="size-4 shrink-0 text-success-500" />
                                <span className="truncate font-medium text-title-50">
                                    {selected.name}
                                </span>
                            </>
                        ) : (
                            <span>No file selected</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            appearance="outline"
                            onPress={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!selected}
                            onPress={confirm}
                        >
                            OK
                        </Button>
                    </div>
                </div>
            </DialogFooter>
        </>
    );
}
