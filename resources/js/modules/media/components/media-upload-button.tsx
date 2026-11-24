import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import { mediaApi, MediaApiError } from '../api/media-api';
import { formatBytes } from '../lib/format';
import type { MediaFolderFilter, MediaUploadLimits } from '../types';

type UploadItem = {
    key: number;
    name: string;
    progress: number;
    status: 'uploading' | 'done' | 'failed';
    message?: string;
};

type Props = {
    limits: MediaUploadLimits;
    folder: MediaFolderFilter;
    onUploaded: () => void;
};

/**
 * Uploads the chosen files one after another. Each file starts private; visibility can be
 * changed later in the details panel.
 */
export function MediaUploadButton({ limits, folder, onUploaded }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState<UploadItem[]>([]);
    const [busy, setBusy] = useState(false);

    const maxBytes = limits.maxKilobytes * 1024;

    function patch(key: number, changes: Partial<UploadItem>) {
        setItems((previous) =>
            previous.map((item) =>
                item.key === key ? { ...item, ...changes } : item,
            ),
        );
    }

    async function uploadAll(files: File[]) {
        setBusy(true);
        const batch = files.map((file, index) => ({
            key: Date.now() + index,
            name: file.name,
            progress: 0,
            status: 'uploading' as const,
        }));
        setItems(batch);

        for (const [index, file] of files.entries()) {
            const item = batch[index];

            if (file.size > maxBytes) {
                patch(item.key, {
                    status: 'failed',
                    message: `Larger than the limit of ${formatBytes(maxBytes)}.`,
                });
                continue;
            }

            try {
                await mediaApi.uploadFile(
                    file,
                    {
                        folder_id:
                            folder === 'root' || folder === 'all'
                                ? null
                                : folder,
                        visibility: 'private',
                    },
                    (percent) => patch(item.key, { progress: percent }),
                );
                patch(item.key, { status: 'done', progress: 100 });
            } catch (failure) {
                const message =
                    failure instanceof MediaApiError && failure.errors.file?.[0]
                        ? failure.errors.file[0]
                        : 'The file could not be uploaded.';
                patch(item.key, { status: 'failed', message });
            }
        }

        setBusy(false);
        onUploaded();
    }

    return (
        <>
            <input
                ref={input}
                type="file"
                multiple
                accept={limits.accept.join(',')}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = '';

                    if (files.length > 0) {
                        uploadAll(files);
                    }
                }}
            />
            <Button
                variant="primary"
                onPress={() => input.current?.click()}
                disabled={busy}
                className="h-11 gap-2 bg-[#465fff] px-4 hover:bg-[#3641f5]"
            >
                <Upload className="size-4" />
                {busy ? 'Uploading…' : 'Upload files'}
            </Button>

            {items.length > 0 && (
                <div className="basis-full space-y-2" aria-live="polite">
                    {items.map((item) => (
                        <Alert
                            key={item.key}
                            status={
                                item.status === 'failed'
                                    ? 'error'
                                    : item.status === 'done'
                                      ? 'success'
                                      : 'info'
                            }
                            className="max-w-none"
                        >
                            <AlertIndicator />
                            <AlertContent>
                                <AlertTitle>
                                    {item.name}
                                    {item.status === 'uploading' &&
                                        ` · ${item.progress}%`}
                                    {item.status === 'done' && ' · uploaded'}
                                </AlertTitle>
                                {item.message && (
                                    <p className="text-sm">{item.message}</p>
                                )}
                            </AlertContent>
                        </Alert>
                    ))}
                </div>
            )}
        </>
    );
}
