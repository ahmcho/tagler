import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { showToast } from '@/components/flash-toaster';
import { Button } from '@/components/tailgrids/core/button';
import { mediaApi, MediaApiError } from '../api/media-api';
import { formatBytes } from '../lib/format';
import type { MediaFolderFilter, MediaUploadLimits } from '../types';

type Props = {
    limits: MediaUploadLimits;
    folder: MediaFolderFilter;
    onUploaded: () => void;
};

/**
 * Uploads the chosen files one after another. Each file starts private; visibility can be
 * changed later in the details panel. Each result shows as a toast.
 */
export function MediaUploadButton({ limits, folder, onUploaded }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);

    const maxBytes = limits.maxKilobytes * 1024;

    async function uploadAll(files: File[]) {
        setBusy(true);

        for (const file of files) {
            if (file.size > maxBytes) {
                showToast({
                    status: 'error',
                    message: `${file.name}: Larger than the limit of ${formatBytes(maxBytes)}.`,
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
                    () => undefined,
                );
                showToast({
                    status: 'success',
                    message: `${file.name} uploaded.`,
                });
            } catch (failure) {
                const message =
                    failure instanceof MediaApiError && failure.errors.file?.[0]
                        ? failure.errors.file[0]
                        : 'The file could not be uploaded.';
                showToast({
                    status: 'error',
                    message: `${file.name}: ${message}`,
                });
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
        </>
    );
}
