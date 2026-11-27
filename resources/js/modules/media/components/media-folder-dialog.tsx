import { Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import { MediaTextField } from './media-text-field';

type Props = {
    title: string;
    initialName: string;
    onSubmit: (name: string) => Promise<void>;
    onClose: () => void;
    submitLabel?: string;
};

/**
 * Creates or renames a folder. Server errors, such as a duplicate name, show under the field.
 */
export function MediaFolderDialog({
    title,
    initialName,
    onSubmit,
    onClose,
    submitLabel = 'Save',
}: Props) {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    return (
        <Dialog isOpen onOpenChange={(open) => !open && onClose()}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <form
                onSubmit={async (event) => {
                    event.preventDefault();
                    setBusy(true);
                    setError(null);

                    try {
                        await onSubmit(name.trim());
                    } catch (failure) {
                        setError(
                            failure instanceof Error
                                ? failure.message
                                : 'The folder could not be saved.',
                        );
                    } finally {
                        setBusy(false);
                    }
                }}
            >
                <DialogBody>
                    <MediaTextField
                        label="Folder name"
                        value={name}
                        onChange={setName}
                        autoFocus
                        required
                        maxLength={120}
                        error={error}
                    />
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="primary"
                        appearance="outline"
                        type="button"
                        onPress={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={busy || name.trim() === ''}
                    >
                        <Save className="size-4" />
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}
