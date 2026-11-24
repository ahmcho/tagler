import { FolderPlus, Images } from 'lucide-react';
import { useState } from 'react';
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
    { mode: 'create' } | { mode: 'rename'; folder: MediaFolder };

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

    const { query, files, folders } = library;
    const selected = files?.data.find((file) => file.id === selectedId) ?? null;
    const canManageFolders = ability('media.folders');
    const path = folderPath(folders, query.folder);
    const folderRows =
        query.trashed || query.search.trim() !== '' || query.category !== null
            ? []
            : childFolders(
                  folders,
                  query.folder === 'root' ? 'root' : query.folder,
              );

    const abilities = {
        update: ability('media.update'),
        visibility: ability('media.visibility'),
        destroy: ability('media.destroy'),
        purge: ability('media.purge'),
    };

    async function createOrRenameFolder(name: string) {
        if (folderDialog?.mode === 'rename') {
            await mediaApi.renameFolder(folderDialog.folder.id, name);
        } else {
            await mediaApi.createFolder(
                name,
                query.folder === 'root' || query.folder === 'all'
                    ? null
                    : query.folder,
            );
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
                        <nav
                            aria-label="Folder path"
                            className="flex flex-wrap items-center gap-1 text-sm text-text-100"
                        >
                            <button
                                type="button"
                                className="font-medium text-title-50 hover:underline"
                                onClick={() =>
                                    library.update({ folder: 'root' })
                                }
                            >
                                Library
                            </button>
                            {path.map((folder) => (
                                <span
                                    key={folder.id}
                                    className="flex items-center gap-1"
                                >
                                    <span aria-hidden>/</span>
                                    <button
                                        type="button"
                                        className="font-medium text-title-50 hover:underline"
                                        onClick={() =>
                                            library.update({
                                                folder: folder.id,
                                            })
                                        }
                                    >
                                        {folder.name}
                                    </button>
                                </span>
                            ))}
                        </nav>
                        <div className="flex flex-wrap items-end gap-3">
                            <MediaSearchField
                                search={query.search}
                                onSearch={(search) =>
                                    library.update({ search })
                                }
                            />
                            <MediaUploadAction
                                limits={upload}
                                folder={query.folder}
                                canUpload={
                                    ability('media.store') && !query.trashed
                                }
                                onUploaded={() => library.refresh()}
                            />
                            <MediaLibraryTools
                                sort={query.sort}
                                category={query.category}
                                trashed={query.trashed}
                                canCreateFolder={canManageFolders}
                                onSort={(sort: MediaSort) =>
                                    library.update({ sort })
                                }
                                onCategory={(category: MediaCategory | null) =>
                                    library.update({ category })
                                }
                                onToggleTrash={() =>
                                    library.update({ trashed: !query.trashed })
                                }
                                onNewFolder={() =>
                                    setFolderDialog({ mode: 'create' })
                                }
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                        {files &&
                        (files.data.length > 0 || folderRows.length > 0) ? (
                            <div className="overflow-x-auto rounded-2xl border border-base-200">
                                <MediaLibraryTable
                                    folders={folderRows}
                                    files={files.data}
                                    canManageFolders={canManageFolders}
                                    onOpenFolder={(folder) =>
                                        library.update({ folder: folder.id })
                                    }
                                    onRenameFolder={(folder) =>
                                        setFolderDialog({
                                            mode: 'rename',
                                            folder,
                                        })
                                    }
                                    onDeleteFolder={(folder) => {
                                        setFolderError(null);
                                        setFolderToDelete(folder);
                                    }}
                                    onOpenFile={(file) =>
                                        setSelectedId(file.id)
                                    }
                                />
                            </div>
                        ) : (
                            <p className="rounded-2xl border border-dashed border-base-200 p-10 text-center text-sm text-text-100">
                                {library.loading
                                    ? 'Loading…'
                                    : query.trashed
                                      ? 'The trash is empty.'
                                      : 'Nothing here yet.'}
                            </p>
                        )}

                        {files && files.meta.last_page > 1 && (
                            <Pagination
                                currentPage={files.meta.current_page}
                                totalPages={files.meta.last_page}
                                onPageChange={(page) =>
                                    library.update({ page })
                                }
                            />
                        )}
                    </CardContent>
                </Card>

                <MediaDetailsSheet
                    key={selected?.id ?? 'none'}
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
                        title={
                            folderDialog.mode === 'rename'
                                ? 'Rename folder'
                                : 'New folder'
                        }
                        initialName={
                            folderDialog.mode === 'rename'
                                ? folderDialog.folder.name
                                : ''
                        }
                        onSubmit={createOrRenameFolder}
                        onClose={() => setFolderDialog(null)}
                    />
                )}

                {folderToDelete && (
                    <Dialog
                        isOpen
                        onOpenChange={(open) =>
                            !open && setFolderToDelete(null)
                        }
                    >
                        <DialogHeader>
                            <DialogTitle>
                                Delete “{folderToDelete.name}”?
                            </DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <p className="text-sm text-text-100">
                                Only empty folders can be deleted. Move their
                                files and subfolders first.
                            </p>
                            {folderError && (
                                <p className="mt-2 text-sm text-error-500">
                                    {folderError}
                                </p>
                            )}
                        </DialogBody>
                        <DialogFooter>
                            <Button
                                variant="primary"
                                appearance="outline"
                                onPress={() => setFolderToDelete(null)}
                            >
                                Cancel
                            </Button>
                            <Button variant="danger" onPress={deleteFolder}>
                                Delete folder
                            </Button>
                        </DialogFooter>
                    </Dialog>
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
