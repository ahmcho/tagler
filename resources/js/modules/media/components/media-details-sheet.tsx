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
import { useClipboard } from '@/hooks/use-clipboard';
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

type DetailsFields = {
    title: string;
    altText: string;
    description: string;
};

type DetailsFieldName = keyof DetailsFields;

const ROOT_FOLDER_VALUE = 'root';

function folderValue(folderId: number | null): string {
    return folderId === null ? ROOT_FOLDER_VALUE : String(folderId);
}

function MediaFileMetadata({ file }: { file: MediaRecord }) {
    return (
        <>
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
                <dd className="text-text-50">{file.extension.toUpperCase()}</dd>
                <dt className="text-text-100">Uploaded by</dt>
                <dd className="text-text-50">
                    {file.uploaded_by?.name ?? '—'}
                </dd>
                {file.dimensions && (
                    <>
                        <dt className="text-text-100">Dimensions</dt>
                        <dd className="text-text-50">
                            {file.dimensions.width} × {file.dimensions.height}
                        </dd>
                    </>
                )}
                <dt className="text-text-100">Processing</dt>
                <dd className="text-text-50">{file.processing_status}</dd>
            </dl>
        </>
    );
}

function MediaVisibilityToggle({
    isPublic,
    disabled,
    onChange,
}: {
    isPublic: boolean;
    disabled: boolean;
    onChange: (isPublic: boolean) => void;
}) {
    return (
        <Toggle
            label={
                isPublic
                    ? 'Public: anyone with the link can open it'
                    : 'Private: only signed-in staff'
            }
            checked={isPublic}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
        />
    );
}

type MediaDetailsFormProps = {
    fields: DetailsFields;
    onFieldChange: (name: DetailsFieldName, value: string) => void;
    folders: MediaFolder[];
    folderId: number | null;
    busy: boolean;
    message: string | null;
    onSubmit: () => void;
    onFolderChange: (value: string) => void;
};

function MediaDetailsForm({
    fields,
    onFieldChange,
    folders,
    folderId,
    busy,
    message,
    onSubmit,
    onFolderChange,
}: MediaDetailsFormProps) {
    const folderOptions = [
        { value: ROOT_FOLDER_VALUE, label: 'Library root' },
        ...folders.map((folder) => ({
            value: String(folder.id),
            label: folder.name,
        })),
    ];

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <MediaTextField
                label="Title"
                value={fields.title}
                onChange={(value) => onFieldChange('title', value)}
            />
            <MediaTextField
                label="Alt text"
                value={fields.altText}
                onChange={(value) => onFieldChange('altText', value)}
            />
            <MediaTextField
                label="Description"
                value={fields.description}
                onChange={(value) => onFieldChange('description', value)}
            />
            <div className="flex items-center gap-3">
                <Button type="submit" variant="primary" disabled={busy}>
                    Save details
                </Button>
                {message && (
                    <span className="text-sm text-text-100">{message}</span>
                )}
            </div>

            <SelectField
                label="Folder"
                value={folderValue(folderId)}
                onChange={onFolderChange}
                options={folderOptions}
            />
        </form>
    );
}

type MediaTrashActionsProps = {
    abilities: Abilities;
    inTrash: boolean;
    busy: boolean;
    confirmPurge: boolean;
    onTrash: () => void;
    onRestore: () => void;
    onRequestPurge: () => void;
    onPurge: () => void;
};

/** Move to trash, restore, and the two-step permanent delete. */
function MediaTrashActions({
    abilities,
    inTrash,
    busy,
    confirmPurge,
    onTrash,
    onRestore,
    onRequestPurge,
    onPurge,
}: MediaTrashActionsProps) {
    return (
        <>
            {abilities.destroy && !inTrash && (
                <Button
                    variant="danger"
                    appearance="outline"
                    disabled={busy}
                    onPress={onTrash}
                >
                    <Trash2 className="size-4" />
                    Move to trash
                </Button>
            )}

            {inTrash && abilities.destroy && (
                <Button variant="primary" disabled={busy} onPress={onRestore}>
                    <RotateCcw className="size-4" />
                    Restore
                </Button>
            )}

            {inTrash && abilities.purge && (
                <div className="space-y-2">
                    {confirmPurge ? (
                        <Button
                            variant="danger"
                            disabled={busy}
                            onPress={onPurge}
                        >
                            Confirm permanent delete
                        </Button>
                    ) : (
                        <Button
                            variant="danger"
                            disabled={busy}
                            onPress={onRequestPurge}
                        >
                            Delete permanently
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}

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
    const [fields, setFields] = useState<DetailsFields>({
        title: file.title ?? '',
        altText: file.alt_text ?? '',
        description: file.description ?? '',
    });
    const [folderId, setFolderId] = useState(file.folder_id ?? null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [confirmPurge, setConfirmPurge] = useState(false);
    const [busy, setBusy] = useState(false);
    const [, copy] = useClipboard();

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

    function updateField(name: DetailsFieldName, value: string) {
        setFields((previous) => ({ ...previous, [name]: value }));
    }

    function changeVisibility(isPublicNext: boolean) {
        run(async () => {
            onChanged(
                await mediaApi.changeVisibility(
                    file.id,
                    isPublicNext ? 'public' : 'private',
                ),
            );
        });
    }

    function saveDetails() {
        run(async () => {
            onChanged(
                await mediaApi.updateFile(file.id, {
                    title: fields.title || null,
                    alt_text: fields.altText || null,
                    description: fields.description || null,
                }),
            );
            setMessage('Saved.');
        });
    }

    function changeFolder(value: string) {
        run(async () => {
            const target = value === ROOT_FOLDER_VALUE ? null : Number(value);

            onChanged(await mediaApi.moveFile(file.id, target));
            setFolderId(target);
            onStructureChanged();
        });
    }

    function copyLink() {
        run(async () => {
            const { url } = await mediaApi.fileUrl(file.id);
            const copied = await copy(
                new URL(url, window.location.origin).href,
            );

            if (copied) {
                setMessage('Link copied.');
            } else {
                setError('The link could not be copied.');
            }
        });
    }

    function trashFile() {
        run(async () => {
            await mediaApi.trashFile(file.id);
            onRemoved(file.id);
        });
    }

    function restoreFile() {
        run(async () => {
            await mediaApi.restoreFile(file.id);
            onRemoved(file.id);
        });
    }

    function purgeFile() {
        run(async () => {
            await mediaApi.purgeFile(file.id);
            onRemoved(file.id);
        });
    }

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

                <MediaFileMetadata file={file} />

                {abilities.visibility && (
                    <MediaVisibilityToggle
                        isPublic={file.visibility === 'public'}
                        disabled={busy || inTrash}
                        onChange={changeVisibility}
                    />
                )}

                {abilities.update && (
                    <MediaDetailsForm
                        fields={fields}
                        onFieldChange={updateField}
                        folders={folders}
                        folderId={folderId}
                        busy={busy}
                        message={message}
                        onSubmit={saveDetails}
                        onFolderChange={changeFolder}
                    />
                )}

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="primary"
                        appearance="outline"
                        onPress={copyLink}
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

                <MediaTrashActions
                    abilities={abilities}
                    inTrash={inTrash}
                    busy={busy}
                    confirmPurge={confirmPurge}
                    onTrash={trashFile}
                    onRestore={restoreFile}
                    onRequestPurge={() => setConfirmPurge(true)}
                    onPurge={purgeFile}
                />
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
