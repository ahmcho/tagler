import { FileImage } from '@tailgrids/icons';
import { useEffect, useState } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { mediaApi } from '../api/media-api';
import type { MediaRecord } from '../types';
import { MediaLibraryPicker } from './media-library-picker';

type Props = {
    label: string;
    /** Uuid of the chosen file, or null when none is chosen. */
    value: string | null;
    onChange: (uuid: string | null) => void;
    accept?: string;
    error?: string | null;
};

/** Form field that stores a media uuid and shows the chosen file. */
export function MediaPickerField({
    label,
    value,
    onChange,
    accept,
    error,
}: Props) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<{
        uuid: string;
        record: MediaRecord | null;
    } | null>(null);

    useEffect(() => {
        if (!value) {
            return;
        }

        let active = true;

        mediaApi
            .showFile(value)
            .then((record) => {
                if (active) {
                    setPreview({ uuid: value, record });
                }
            })
            .catch(() => {
                if (active) {
                    setPreview({ uuid: value, record: null });
                }
            });

        return () => {
            active = false;
        };
    }, [value]);

    const shown = value && preview?.uuid === value ? preview.record : null;
    const previewUrl =
        shown?.category === 'pictures'
            ? (shown.thumbnail_url ?? shown.url)
            : null;
    const status = !value
        ? 'No file selected'
        : shown
          ? shown.name
          : preview?.uuid === value
            ? 'This file is no longer available'
            : 'Loading…';

    return (
        <div className="flex flex-col gap-2">
            <FieldLabel>{label}</FieldLabel>
            <div className="flex items-center gap-4 rounded-xl border border-base-200 bg-background-100 p-3">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background-soft-100 text-text-200">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt=""
                            className="size-full object-cover"
                        />
                    ) : (
                        <FileImage className="size-8" />
                    )}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm text-text-100">
                    {status}
                </p>
                <div className="flex shrink-0 gap-2">
                    <Button
                        variant="primary"
                        appearance="outline"
                        onPress={() => setOpen(true)}
                    >
                        Browse
                    </Button>
                    {value && (
                        <Button variant="ghost" onPress={() => onChange(null)}>
                            Remove
                        </Button>
                    )}
                </div>
            </div>
            {error && <FieldError>{error}</FieldError>}

            <MediaLibraryPicker
                open={open}
                onClose={() => setOpen(false)}
                onSelect={onChange}
                accept={accept}
            />
        </div>
    );
}
