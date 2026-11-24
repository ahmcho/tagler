import { Images } from 'lucide-react';
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
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import { Pagination } from '@/components/tailgrids/core/pagination';
import { useAbility } from '@/hooks/use-ability';
import { mediaApi, MediaApiError } from '@/modules/media/api/media-api';
import { MediaCategoryCards } from '@/modules/media/components/media-category-cards';
import { MediaDetailsSheet } from '@/modules/media/components/media-details-sheet';
import { MediaFileGrid } from '@/modules/media/components/media-file-grid';
import { MediaFolderDialog } from '@/modules/media/components/media-folder-dialog';
import { MediaFolderGrid } from '@/modules/media/components/media-folder-grid';
import { MediaStorageDetails } from '@/modules/media/components/media-storage-details';
import { MediaToolbar } from '@/modules/media/components/media-toolbar';
import { useMediaLibrary } from '@/modules/media/hooks/use-media-library';
import { childFolders, folderPath } from '@/modules/media/lib/format';
import type {
    MediaFolder,
    MediaLibraryQuery,
    MediaUploadLimits,
} from '@/modules/media/types';
import { index as mediaIndex } from '@/routes/media';

type Props = {
    upload: MediaUploadLimits & { maxKilobytes: number };
    quotaBytes: number | null;
};

function emptyMessage(loading: boolean, query: MediaLibraryQuery): string {
    if (loading) {
        return 'Loading…';
    }

    if (query.trashed) {
        return 'The trash is empty.';
    }

    if (query.category !== null || query.search.trim() !== '') {
        return 'No files match these filters.';
    }

    return 'No files in this folder yet. Upload files to start.';
}

type FolderDialog =
    | { mode: 'create' }
    | { mode: 'rename'; folder: MediaFolder };

export default function MediaIndex({ upload }: Props) {
    const ability = useAbility();
    const library = useMediaLibrary();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [folderDialog, setFolderDialog] = useState<FolderDialog | null>(null);
    const [folderToDelete, setFolderToDelete] = useState<MediaFolder | null>(
        null,
    );
    const [folderError, setFolderError] = useState<string | null>(null);

    const { query, files, folders, usage } = library;
    const selected = files?.data.find((file) => file.id === selectedId) ?? null;
    const currentFolders = query.trashed
        ? []
        : childFolders(folders, query.folder);
    const path = folderPath(folders, query.folder);
    const canManageFolders = ability('media.folders');

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
                query.folder === 'root' ? null : query.folder,
            );
        }

        setFolderDialog(null);
        await library.refresh();
    }

    async function deleteFolder() {
        if (!folderToDelete) {
            return;
        }

        try {
            await mediaApi.deleteFolder(folderToDelete.id);
            setFolderToDelete(null);
            setFolderError(null);
            await library.refresh();
        } catch (failure) {
            setFolderError(
                failure instanceof MediaApiError
                    ? failure.message
                    : 'The folder could not be deleted.',
            );
        }
    }

    return (
        <ResourcePage title="Media">
            {library.error && (
                <Alert status="error" className="max-w-none">
                    <AlertIndicator />
                    <AlertContent>
                        <AlertTitle>{library.error}</AlertTitle>
                    </AlertContent>
                </Alert>
            )}

            <MediaCategoryCards
                usage={usage}
                active={query.category}
                onSelect={(category) => library.update({ category })}
            />

            <MediaStorageDetails usage={usage} />

            <MediaToolbar
                search={query.search}
                sort={query.sort}
                trashed={query.trashed}
                folder={query.folder}
                limits={upload}
                canUpload={ability('media.store')}
                canCreateFolder={canManageFolders}
                onSearch={(search) => library.update({ search })}
                onSort={(sort) => library.update({ sort })}
                onToggleTrash={() =>
                    library.update({ trashed: !query.trashed })
                }
                onNewFolder={() => setFolderDialog({ mode: 'create' })}
                onUploaded={() => library.refresh()}
            />

            <nav
                aria-label="Folder path"
                className="flex flex-wrap items-center gap-1 text-sm text-text-100"
            >
                <button
                    type="button"
                    className="hover:underline"
                    onClick={() => library.update({ folder: 'root' })}
                >
                    Library
                </button>
                {path.map((folder) => (
                    <span key={folder.id} className="flex items-center gap-1">
                        <span aria-hidden>/</span>
                        <button
                            type="button"
                            className="hover:underline"
                            onClick={() =>
                                library.update({ folder: folder.id })
                            }
                        >
                            {folder.name}
                        </button>
                    </span>
                ))}
            </nav>

            <MediaFolderGrid
                folders={currentFolders}
                canManage={canManageFolders}
                onOpen={(folder) => library.update({ folder: folder.id })}
                onRename={(folder) =>
                    setFolderDialog({ mode: 'rename', folder })
                }
                onDelete={(folder) => {
                    setFolderError(null);
                    setFolderToDelete(folder);
                }}
            />

            {files && files.data.length > 0 ? (
                <MediaFileGrid
                    files={files.data}
                    onOpen={(file) => setSelectedId(file.id)}
                />
            ) : (
                <p className="rounded-xl border border-dashed border-base-200 p-10 text-center text-sm text-text-100">
                    {emptyMessage(library.loading, query)}
                </p>
            )}

            {files && files.meta.last_page > 1 && (
                <Pagination
                    currentPage={files.meta.current_page}
                    totalPages={files.meta.last_page}
                    onPageChange={(page) => library.update({ page })}
                />
            )}

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
                    onOpenChange={(open) => !open && setFolderToDelete(null)}
                >
                    <DialogHeader>
                        <DialogTitle>
                            Delete “{folderToDelete.name}”?
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <p className="text-sm text-text-100">
                            Only empty folders can be deleted. Move their files
                            and subfolders first.
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
        </ResourcePage>
    );
}

MediaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Media',
            href: mediaIndex.url(),
            icon: <Images />,
        },
    ],
};
