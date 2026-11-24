import { Copy, Download, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SelectField } from '@/components/select-field';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetOverlay,
    SheetTitle,
} from '@/components/tailgrids/core/sheet';
import { Toggle } from '@/components/tailgrids/core/toggle';
import { mediaApi, MediaApiError } from '../api/media-api';
import { formatBytes, formatDate } from '../lib/format';
import type { MediaFolder, MediaRecord } from '../types';
import { MediaTextField } from './media-text-field';

type Abilities = {
    update: boolean;
    visibility: boolean;
    destroy: boolean;
    purge: boolean;
};

type Props = {
    file: MediaRecord | null;
    folders: MediaFolder[];
    abilities: Abilities;
    inTrash: boolean;
    onClose: () => void;
    onChanged: (file: MediaRecord) => void;
    onRemoved: (uuid: string) => void;
    onStructureChanged: () => void;
};

type BodyProps = Omit<Props, 'file' | 'onClose'> & { file: MediaRecord };

/** Preview, metadata, visibility and actions for one file. The sheet keys it per file. */
function MediaDetailsBody({
    file,
    folders,
    abilities,
    inTrash,
    onChanged,
    onRemoved,
    onStructureChanged,
}: BodyProps) {
    const [title, setTitle] = useState(file?.title ?? '');
    const [altText, setAltText] = useState(file?.alt_text ?? '');
    const [description, setDescription] = useState(file?.description ?? '');
    const [folderId, setFolderId] = useState(file?.folder_id ?? null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [confirmPurge, setConfirmPurge] = useState(false);
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<void>) {
        setBusy(true);
        setError(null);

        try {
            await action();
        } catch (failure) {
            setError(
                failure instanceof MediaApiError
                    ? failure.message
                    : 'The change could not be saved.',
            );
        } finally {
            setBusy(false);
        }
    }

    const isPublic = file.visibility === 'public';
    const folderOptions = [
        { value: 'root', label: 'Library root' },
        ...folders.map((folder) => ({
            value: String(folder.id),
            label: folder.name,
        })),
    ];

    return (
        <>
            <SheetHeader>
                <SheetTitle>{file.name}</SheetTitle>
                <SheetDescription>
                    {file.mime_type} · {formatBytes(file.size)} ·{' '}
                    {formatDate(file.created_at)}
                </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
                {error && (
                    <Alert status="error" className="max-w-none">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{error}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                    {file.thumbnail_url ? (
                        <img
                            src={file.thumbnail_url}
                            alt={file.alt_text ?? ''}
                            className="size-full object-contain"
                        />
                    ) : (
                        <span className="text-sm text-text-100">
                            No preview for this file type.
                        </span>
                    )}
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <dt className="text-text-100">Type</dt>
                    <dd className="text-text-50">
                        {file.extension.toUpperCase()}
                    </dd>
                    <dt className="text-text-100">Uploaded by</dt>
                    <dd className="text-text-50">
                        {file.uploaded_by?.name ?? '—'}
                    </dd>
                    {file.dimensions && (
                        <>
                            <dt className="text-text-100">Dimensions</dt>
                            <dd className="text-text-50">
                                {file.dimensions.width} ×{' '}
                                {file.dimensions.height}
                            </dd>
                        </>
                    )}
                    <dt className="text-text-100">Processing</dt>
                    <dd className="text-text-50">{file.processing_status}</dd>
                </dl>

                {abilities.visibility && (
                    <Toggle
                        label={
                            isPublic
                                ? 'Public: anyone with the link can open it'
                                : 'Private: only signed-in staff'
                        }
                        checked={isPublic}
                        disabled={busy || inTrash}
                        onChange={(event) =>
                            run(async () => {
                                onChanged(
                                    await mediaApi.changeVisibility(
                                        file.id,
                                        event.target.checked
                                            ? 'public'
                                            : 'private',
                                    ),
                                );
                            })
                        }
                    />
                )}

                {abilities.update && (
                    <form
                        className="space-y-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            run(async () => {
                                onChanged(
                                    await mediaApi.updateFile(file.id, {
                                        title: title || null,
                                        alt_text: altText || null,
                                        description: description || null,
                                    }),
                                );
                                setMessage('Saved.');
                            });
                        }}
                    >
                        <MediaTextField
                            label="Title"
                            value={title}
                            onChange={setTitle}
                        />
                        <MediaTextField
                            label="Alt text"
                            value={altText}
                            onChange={setAltText}
                        />
                        <MediaTextField
                            label="Description"
                            value={description}
                            onChange={setDescription}
                        />
                        <div className="flex items-center gap-3">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={busy}
                            >
                                Save details
                            </Button>
                            {message && (
                                <span className="text-sm text-text-100">
                                    {message}
                                </span>
                            )}
                        </div>

                        <SelectField
                            label="Folder"
                            value={
                                folderId === null ? 'root' : String(folderId)
                            }
                            onChange={(value) =>
                                run(async () => {
                                    const target =
                                        value === 'root' ? null : Number(value);
                                    onChanged(
                                        await mediaApi.moveFile(
                                            file.id,
                                            target,
                                        ),
                                    );
                                    setFolderId(target);
                                    onStructureChanged();
                                })
                            }
                            options={folderOptions}
                        />
                    </form>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="primary"
                        appearance="outline"
                        onPress={() =>
                            run(async () => {
                                const { url } = await mediaApi.fileUrl(file.id);
                                await navigator.clipboard.writeText(
                                    new URL(url, window.location.origin).href,
                                );
                                setMessage('Link copied.');
                            })
                        }
                    >
                        <Copy className="size-4" />
                        Copy link
                    </Button>

                    <a
                        href={file.download_url}
                        className="inline-flex items-center gap-2 rounded-lg border border-base-200 px-4 py-2 text-sm font-medium text-text-50"
                    >
                        <Download className="size-4" />
                        Download
                    </a>
                </div>

                {abilities.destroy && !inTrash && (
                    <Button
                        variant="danger"
                        appearance="outline"
                        disabled={busy}
                        onPress={() =>
                            run(async () => {
                                await mediaApi.trashFile(file.id);
                                onRemoved(file.id);
                            })
                        }
                    >
                        <Trash2 className="size-4" />
                        Move to trash
                    </Button>
                )}

                {inTrash && abilities.destroy && (
                    <Button
                        variant="primary"
                        disabled={busy}
                        onPress={() =>
                            run(async () => {
                                await mediaApi.restoreFile(file.id);
                                onRemoved(file.id);
                            })
                        }
                    >
                        <RotateCcw className="size-4" />
                        Restore
                    </Button>
                )}

                {inTrash && abilities.purge && (
                    <div className="space-y-2">
                        {!confirmPurge ? (
                            <Button
                                variant="danger"
                                disabled={busy}
                                onPress={() => setConfirmPurge(true)}
                            >
                                Delete permanently
                            </Button>
                        ) : (
                            <Button
                                variant="danger"
                                disabled={busy}
                                onPress={() =>
                                    run(async () => {
                                        await mediaApi.purgeFile(file.id);
                                        onRemoved(file.id);
                                    })
                                }
                            >
                                Confirm permanent delete
                            </Button>
                        )}
                    </div>
                )}
            </SheetBody>
        </>
    );
}

/**
 * Details sheet. It stays mounted while it closes, so the exit animation plays. The last file
 * stays in view until the next one opens.
 */
export function MediaDetailsSheet(props: Props) {
    const { file, onClose } = props;
    const [shownFile, setShownFile] = useState(file);

    if (file && file !== shownFile) {
        setShownFile(file);
    }

    return (
        <Sheet
            isOpen={file !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <SheetOverlay>
                <SheetContent className="w-full max-w-lg">
                    {shownFile && (
                        <MediaDetailsBody
                            {...props}
                            key={shownFile.id}
                            file={shownFile}
                        />
                    )}
                </SheetContent>
            </SheetOverlay>
        </Sheet>
    );
}
