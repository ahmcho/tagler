import { FolderPlus, Images } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { ResourcePage } from '@/components/resource/resource-page';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import { Pagination } from '@/components/tailgrids/core/pagination';
import { useAbility } from '@/hooks/use-ability';
import { mediaApi, MediaApiError } from '@/modules/media/api/media-api';
import { MediaDetailsSheet } from '@/modules/media/components/media-details-sheet';
import { MediaFolderDialog } from '@/modules/media/components/media-folder-dialog';
import { MediaLibraryTable } from '@/modules/media/components/media-library-table';
import {
    MediaLibraryTools,
    MediaSearchField,
    MediaUploadAction,
} from '@/modules/media/components/media-toolbar';
import { useMediaLibrary } from '@/modules/media/hooks/use-media-library';
import { childFolders, folderPath } from '@/modules/media/lib/format';
import type {
    MediaCategory,
    MediaFolder,
    MediaFolderFilter,
    MediaLibraryQuery,
    MediaSort,
    MediaUploadLimits,
} from '@/modules/media/types';
import { library as mediaLibrary, index as mediaIndex } from '@/routes/media';

type Props = {
    upload: MediaUploadLimits;
    quotaBytes: number | null;
};

type FolderDialog =
    | { mode: 'create' }
    | { mode: 'rename'; folder: MediaFolder };

/** Reads the starting folder and search from the URL, for links from the dashboard. */
function initialQueryFromUrl(): Partial<MediaLibraryQuery> {
    const params = new URLSearchParams(window.location.search);
    const folder = params.get('folder');
    const search = params.get('search');

    return {
        folder: folder ? (Number(folder) as MediaFolderFilter) : 'root',
        search: search ?? '',
    };
}

/** The folder a new folder is created in. The root and the "all" view both mean the top level. */
function parentFolderFor(folder: MediaFolderFilter): number | null {
    return folder === 'root' || folder === 'all' ? null : folder;
}

/** Subfolders of the open folder. A search, a category or the trash shows files only. */
function visibleFolderRows(
    folders: MediaFolder[],
    query: MediaLibraryQuery,
): MediaFolder[] {
    if (
        query.trashed ||
        query.search.trim() !== '' ||
        query.category !== null
    ) {
        return [];
    }

    return childFolders(folders, query.folder);
}

function folderDialogTitle(dialog: FolderDialog): string {
    return dialog.mode === 'rename' ? 'Rename folder' : 'New folder';
}

function folderDialogInitialName(dialog: FolderDialog): string {
    return dialog.mode === 'rename' ? dialog.folder.name : '';
}

function emptyLibraryMessage(loading: boolean, trashed: boolean): string {
    if (loading) {
        return 'Loading…';
    }

    return trashed ? 'The trash is empty.' : 'Nothing here yet.';
}

function FolderPathNav({
    path,
    onOpen,
}: {
    path: MediaFolder[];
    onOpen: (folder: MediaFolderFilter) => void;
}) {
    return (
        <nav
            aria-label="Folder path"
            className="flex flex-wrap items-center gap-1 text-sm text-text-100"
        >
            <button
                type="button"
                className="font-medium text-title-50 hover:underline"
                onClick={() => onOpen('root')}
            >
                Library
            </button>
            {path.map((folder) => (
                <span key={folder.id} className="flex items-center gap-1">
                    <span aria-hidden>/</span>
                    <button
                        type="button"
                        className="font-medium text-title-50 hover:underline"
                        onClick={() => onOpen(folder.id)}
                    >
                        {folder.name}
                    </button>
                </span>
            ))}
        </nav>
    );
}

function FolderDeleteDialog({
    folder,
    error,
    onCancel,
    onConfirm,
}: {
    folder: MediaFolder;
    error: string | null;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog isOpen onOpenChange={(open) => !open && onCancel()}>
            <DialogHeader>
                <DialogTitle>Delete “{folder.name}”?</DialogTitle>
            </DialogHeader>
            <DialogBody>
                <p className="text-sm text-text-100">
                    Only empty folders can be deleted. Move their files and
                    subfolders first.
                </p>
                {error && (
                    <p className="mt-2 text-sm text-error-500">{error}</p>
                )}
            </DialogBody>
            <DialogFooter>
                <Button
                    variant="primary"
                    appearance="outline"
                    onPress={onCancel}
                >
                    Cancel
                </Button>
                <Button variant="danger" onPress={onConfirm}>
                    Delete folder
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

type LibraryFiles = ReturnType<typeof useMediaLibrary>['files'];

type MediaLibraryContentProps = {
    files: LibraryFiles;
    folderRows: MediaFolder[];
    canManageFolders: boolean;
    loading: boolean;
    trashed: boolean;
    onOpenFolder: (folder: MediaFolder) => void;
    onRenameFolder: (folder: MediaFolder) => void;
    onDeleteFolder: (folder: MediaFolder) => void;
    onOpenFile: ComponentProps<typeof MediaLibraryTable>['onOpenFile'];
    onPageChange: (page: number) => void;
};

/** The table or the empty message, then the pager. */
function MediaLibraryContent({
    files,
    folderRows,
    canManageFolders,
    loading,
    trashed,
    onOpenFolder,
    onRenameFolder,
    onDeleteFolder,
    onOpenFile,
    onPageChange,
}: MediaLibraryContentProps) {
    const hasRows = files
        ? files.data.length > 0 || folderRows.length > 0
        : false;

    return (
        <CardContent className="space-y-6 p-6">
            {files && hasRows ? (
                <div className="overflow-x-auto rounded-2xl border border-base-200">
                    <MediaLibraryTable
                        folders={folderRows}
                        files={files.data}
                        canManageFolders={canManageFolders}
                        onOpenFolder={onOpenFolder}
                        onRenameFolder={onRenameFolder}
                        onDeleteFolder={onDeleteFolder}
                        onOpenFile={onOpenFile}
                    />
                </div>
            ) : (
                <p className="rounded-2xl border border-dashed border-base-200 p-10 text-center text-sm text-text-100">
                    {emptyLibraryMessage(loading, trashed)}
                </p>
            )}

            {files && files.meta.last_page > 1 && (
                <Pagination
                    currentPage={files.meta.current_page}
                    totalPages={files.meta.last_page}
                    onPageChange={onPageChange}
                />
            )}
        </CardContent>
    );
}

/**
 * The full library, opened from the dashboard's View All links. It lists folders and files and
 * lets the user move through folders, like a cloud drive.
 */
export default function MediaLibrary({ upload }: Props) {
    const ability = useAbility();
    const [initial] = useState(initialQueryFromUrl);
    const library = useMediaLibrary({ ...initial, perPage: 20 });
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [folderDialog, setFolderDialog] = useState<FolderDialog | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<MediaFolder | null>(
        null,
    );
    const [folderError, setFolderError] = useState<string | null>(null);

    const { query, files, folders, update } = library;
    const [searchInput, setSearchInput] = useState(query.search);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const search = searchInput.trim();

            if (search !== query.search) {
                update({ search });
            }
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchInput, query.search, update]);
    const selected = files?.data.find((file) => file.id === selectedId) ?? null;
    const canManageFolders = ability('media.folders');
    const path = folderPath(folders, query.folder);
    const folderRows = visibleFolderRows(folders, query);

    const abilities = {
        update: ability('media.update'),
        visibility: ability('media.visibility'),
        destroy: ability('media.destroy'),
        purge: ability('media.purge'),
    };

    function openFolder(folder: MediaFolder) {
        library.update({ folder: folder.id });
    }

    function requestFolderDelete(folder: MediaFolder) {
        setFolderError(null);
        setFolderToDelete(folder);
    }

    async function createOrRenameFolder(name: string) {
        if (folderDialog?.mode === 'rename') {
            await mediaApi.renameFolder(folderDialog.folder.id, name);
        } else {
            await mediaApi.createFolder(name, parentFolderFor(query.folder));
        }

        setFolderDialog(null);
        library.refresh();
    }

    async function deleteFolder() {
        if (!folderToDelete) {
            return;
        }

        try {
            await mediaApi.deleteFolder(folderToDelete.id);
            setFolderToDelete(null);
            setFolderError(null);
            library.refresh();
        } catch (failure) {
            setFolderError(
                failure instanceof MediaApiError
                    ? failure.message
                    : 'The folder could not be deleted.',
            );
        }
    }

    return (
        <ResourcePage title="Library">
            <div className="space-y-6">
                <h1 className="text-xl font-semibold text-title-50">Library</h1>

                {library.error && (
                    <Alert status="error" className="max-w-none">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{library.error}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                <Card className="gap-0 rounded-2xl border border-base-200 bg-card-background-50">
                    <CardHeader className="flex flex-col gap-3 border-b border-base-100/60 p-6">
                        <FolderPathNav
                            path={path}
                            onOpen={(folder) => library.update({ folder })}
                        />
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex shrink-0 items-center gap-3">
                                <MediaSearchField
                                    search={searchInput}
                                    onSearch={setSearchInput}
                                />
                                <MediaUploadAction
                                    limits={upload}
                                    folder={query.folder}
                                    canUpload={
                                        ability('media.store') && !query.trashed
                                    }
                                    onUploaded={() => library.refresh()}
                                />
                            </div>
                            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center xl:justify-end">
                                <MediaLibraryTools
                                    sort={query.sort}
                                    category={query.category}
                                    trashed={query.trashed}
                                    canCreateFolder={canManageFolders}
                                    onSort={(sort: MediaSort) =>
                                        library.update({ sort })
                                    }
                                    onCategory={(
                                        category: MediaCategory | null,
                                    ) => library.update({ category })}
                                    onToggleTrash={() =>
                                        library.update({
                                            trashed: !query.trashed,
                                        })
                                    }
                                    onNewFolder={() =>
                                        setFolderDialog({ mode: 'create' })
                                    }
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <MediaLibraryContent
                        files={files}
                        folderRows={folderRows}
                        canManageFolders={canManageFolders}
                        loading={library.loading}
                        trashed={query.trashed}
                        onOpenFolder={openFolder}
                        onRenameFolder={(folder) =>
                            setFolderDialog({ mode: 'rename', folder })
                        }
                        onDeleteFolder={requestFolderDelete}
                        onOpenFile={(file) => setSelectedId(file.id)}
                        onPageChange={(page) => library.update({ page })}
                    />
                </Card>

                <MediaDetailsSheet
                    file={selected}
                    folders={folders}
                    abilities={abilities}
                    inTrash={query.trashed}
                    onClose={() => setSelectedId(null)}
                    onChanged={(updated) => library.replaceFile(updated)}
                    onRemoved={(uuid) => {
                        library.removeFile(uuid);
                        setSelectedId(null);
                        library.refresh();
                    }}
                    onStructureChanged={() => library.refresh()}
                />

                {folderDialog && (
                    <MediaFolderDialog
                        title={folderDialogTitle(folderDialog)}
                        initialName={folderDialogInitialName(folderDialog)}
                        onSubmit={createOrRenameFolder}
                        onClose={() => setFolderDialog(null)}
                    />
                )}

                {folderToDelete && (
                    <FolderDeleteDialog
                        folder={folderToDelete}
                        error={folderError}
                        onCancel={() => setFolderToDelete(null)}
                        onConfirm={deleteFolder}
                    />
                )}
            </div>
        </ResourcePage>
    );
}

MediaLibrary.layout = {
    breadcrumbs: [
        {
            title: 'File Manager',
            href: mediaIndex.url(),
            icon: <Images />,
        },
        {
            title: 'Library',
            href: mediaLibrary.url(),
            icon: <FolderPlus />,
        },
    ],
};
