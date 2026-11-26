import { Copy, Download, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { showToast } from '@/components/flash-toaster';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tailgrids/core/tooltip';
import { useClipboard } from '@/hooks/use-clipboard';
import { mediaApi, MediaApiError } from '../api/media-api';
import { formatBytes, formatDate } from '../lib/format';
import { parseLinkLifetime } from '../lib/link-lifetime';
import type { MediaFolder, MediaRecord } from '../types';
import { MediaLinkLifetime } from './media-link-lifetime';
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

type MediaDetailsUpdate = Partial<
    Pick<MediaRecord, 'title' | 'alt_text' | 'description' | 'link_ttl_minutes'>
>;

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
    canChangeVisibility: boolean;
    showDetails: boolean;
    pendingPublic: boolean;
    onVisibilityChange: (isPublic: boolean) => void;
    lifetime: string;
    lifetimeError: string | null;
    onLifetimeChange: (value: string) => void;
    fields: DetailsFields;
    onFieldChange: (name: DetailsFieldName, value: string) => void;
    folders: MediaFolder[];
    folderId: number | null;
    onFolderChange: (value: string) => void;
    disabled: boolean;
    canSave: boolean;
    busy: boolean;
    onSubmit: () => void;
};

/**
 * Every change in this form waits for the Save details button, which is the last control.
 */
function MediaDetailsForm({
    canChangeVisibility,
    showDetails,
    pendingPublic,
    onVisibilityChange,
    lifetime,
    lifetimeError,
    onLifetimeChange,
    fields,
    onFieldChange,
    folders,
    folderId,
    onFolderChange,
    disabled,
    canSave,
    busy,
    onSubmit,
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
            {canChangeVisibility && (
                <MediaVisibilityToggle
                    isPublic={pendingPublic}
                    disabled={disabled}
                    onChange={onVisibilityChange}
                />
            )}

            {showDetails && !pendingPublic && (
                <MediaLinkLifetime
                    value={lifetime}
                    error={lifetimeError}
                    disabled={disabled}
                    onChange={onLifetimeChange}
                />
            )}

            {showDetails && (
                <>
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
                        onChange={(value) =>
                            onFieldChange('description', value)
                        }
                    />
                    <SelectField
                        label="Folder"
                        value={folderValue(folderId)}
                        onChange={onFolderChange}
                        options={folderOptions}
                    />
                </>
            )}

            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={busy || !canSave}
                >
                    Save details
                </Button>
            </div>
        </form>
    );
}

/** Wraps an icon-only action so its text shows as a popover on hover and focus. */
function ActionTooltip({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <Tooltip placement="top">
            <TooltipTrigger asChild>
                <span className="inline-flex">{children}</span>
            </TooltipTrigger>
            <TooltipContent className="z-[60] block">{label}</TooltipContent>
        </Tooltip>
    );
}

/** Preview, metadata, actions and the details form for one file. The sheet keys it per file. */
function MediaDetailsBody({
    file,
    folders,
    abilities,
    inTrash,
    onChanged,
    onRemoved,
    onStructureChanged,
}: BodyProps) {
    const savedLifetime =
        file.link_ttl_minutes === null ? '' : String(file.link_ttl_minutes);
    const [pendingPublic, setPendingPublic] = useState(
        file.visibility === 'public',
    );
    const [fields, setFields] = useState<DetailsFields>({
        title: file.title ?? '',
        altText: file.alt_text ?? '',
        description: file.description ?? '',
    });
    const [folderId, setFolderId] = useState(file.folder_id ?? null);
    const [lifetime, setLifetime] = useState(savedLifetime);
    const [lifetimeError, setLifetimeError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmPurge, setConfirmPurge] = useState(false);
    const [inUse, setInUse] = useState(false);
    const [confirmForce, setConfirmForce] = useState(false);
    const [busy, setBusy] = useState(false);
    const [, copy] = useClipboard();

    const visibilityChanged = pendingPublic !== (file.visibility === 'public');
    const folderChanged = folderId !== (file.folder_id ?? null);
    const detailsChanged =
        fields.title !== (file.title ?? '') ||
        fields.altText !== (file.alt_text ?? '') ||
        fields.description !== (file.description ?? '');
    // A changed lifetime is saved even while the file is public, when the field is hidden.
    const lifetimeShown = !pendingPublic;
    const lifetimeChanged = lifetime.trim() !== savedLifetime;
    const hasChanges =
        visibilityChanged || folderChanged || detailsChanged || lifetimeChanged;

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

    function changeLifetime(value: string) {
        setLifetime(value);
        setLifetimeError(null);
    }

    /**
     * Saves every pending change. Visibility and folder go first, then the details and the
     * lifetime in one request. Each saved step updates the file, so a later failure keeps the
     * earlier steps saved.
     */
    function saveChanges() {
        const parsed = lifetimeChanged ? parseLinkLifetime(lifetime) : null;

        if (parsed && !parsed.ok) {
            setLifetimeError(parsed.error);

            // A hidden field shows no error, so the message also goes to the alert.
            if (!lifetimeShown) {
                setError(parsed.error);
            }

            return;
        }

        setLifetimeError(null);

        run(async () => {
            let latest = file;

            if (visibilityChanged) {
                latest = await mediaApi.changeVisibility(
                    file.id,
                    pendingPublic ? 'public' : 'private',
                );
                onChanged(latest);
            }

            if (folderChanged) {
                latest = await mediaApi.moveFile(file.id, folderId);
                onChanged(latest);
                onStructureChanged();
            }

            const update: MediaDetailsUpdate = {};

            if (detailsChanged) {
                update.title = fields.title || null;
                update.alt_text = fields.altText || null;
                update.description = fields.description || null;
            }

            if (lifetimeChanged && parsed?.ok) {
                update.link_ttl_minutes = parsed.value;
            }

            if (Object.keys(update).length > 0) {
                latest = await mediaApi.updateFile(file.id, update);
                onChanged(latest);
            }

            showToast({ status: 'success', message: 'Details saved.' });
        });
    }

    function copyLink() {
        run(async () => {
            const { url } = await mediaApi.fileUrl(file.id);
            const copied = await copy(
                new URL(url, window.location.origin).href,
            );

            if (copied) {
                showToast({ status: 'success', message: 'Link copied.' });
            } else {
                setError('The link could not be copied.');
            }
        });
    }

    function trashFile() {
        run(async () => {
            try {
                await mediaApi.trashFile(file.id);
            } catch (failure) {
                if (
                    failure instanceof MediaApiError &&
                    failure.status === 409
                ) {
                    setError(failure.message);
                    setInUse(true);

                    return;
                }

                throw failure;
            }

            onRemoved(file.id);
        });
    }

    function trashFileAnyway() {
        run(async () => {
            await mediaApi.trashFile(file.id, true);
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

                <div
                    role="group"
                    aria-label="File actions"
                    className="flex items-center gap-2"
                >
                    <ActionTooltip label="Copy link">
                        <Button
                            variant="primary"
                            appearance="outline"
                            iconOnly
                            aria-label="Copy link"
                            onPress={copyLink}
                        >
                            <Copy className="size-4" />
                        </Button>
                    </ActionTooltip>

                    <ActionTooltip label="Download">
                        <a
                            href={file.download_url}
                            aria-label="Download"
                            className="inline-flex size-10 items-center justify-center rounded-lg border border-base-200 text-text-50"
                        >
                            <Download className="size-4" />
                        </a>
                    </ActionTooltip>

                    {abilities.destroy && !inTrash && (
                        <ActionTooltip label="Move to trash">
                            <Button
                                variant="danger"
                                appearance="outline"
                                iconOnly
                                aria-label="Move to trash"
                                disabled={busy}
                                onPress={trashFile}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </ActionTooltip>
                    )}

                    {inTrash && abilities.destroy && (
                        <ActionTooltip label="Restore">
                            <Button
                                variant="primary"
                                appearance="outline"
                                iconOnly
                                aria-label="Restore"
                                disabled={busy}
                                onPress={restoreFile}
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                        </ActionTooltip>
                    )}

                    {inTrash && abilities.purge && (
                        <ActionTooltip
                            label={
                                confirmPurge
                                    ? 'Confirm permanent delete'
                                    : 'Delete permanently'
                            }
                        >
                            <Button
                                variant="danger"
                                appearance={confirmPurge ? 'fill' : 'outline'}
                                iconOnly
                                aria-label={
                                    confirmPurge
                                        ? 'Confirm permanent delete'
                                        : 'Delete permanently'
                                }
                                disabled={busy}
                                onPress={
                                    confirmPurge
                                        ? purgeFile
                                        : () => setConfirmPurge(true)
                                }
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </ActionTooltip>
                    )}
                </div>

                {inUse && abilities.destroy && !inTrash && (
                    <Button
                        variant="danger"
                        disabled={busy}
                        onPress={
                            confirmForce
                                ? trashFileAnyway
                                : () => setConfirmForce(true)
                        }
                    >
                        {confirmForce
                            ? 'Confirm delete anyway'
                            : 'Delete anyway'}
                    </Button>
                )}

                {(abilities.visibility || abilities.update) && (
                    <MediaDetailsForm
                        canChangeVisibility={abilities.visibility}
                        showDetails={abilities.update}
                        pendingPublic={pendingPublic}
                        onVisibilityChange={setPendingPublic}
                        lifetime={lifetime}
                        lifetimeError={lifetimeError}
                        onLifetimeChange={changeLifetime}
                        fields={fields}
                        onFieldChange={updateField}
                        folders={folders}
                        folderId={folderId}
                        onFolderChange={(value) =>
                            setFolderId(
                                value === ROOT_FOLDER_VALUE
                                    ? null
                                    : Number(value),
                            )
                        }
                        disabled={busy || inTrash}
                        canSave={hasChanges}
                        busy={busy}
                        onSubmit={saveChanges}
                    />
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
                <SheetContent modalProps={{ className: 'w-full sm:w-96' }}>
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
