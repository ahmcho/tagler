import { UploadCloud } from '@tailgrids/icons';
import { DropZone, FileTrigger } from 'react-aria-components';
import type { FileDropItem } from 'react-aria-components';
import { Button } from '@/components/tailgrids/core/button';
import { Progress } from '@/components/tailgrids/core/progress';
import { cn } from '@/utils/cn';

type Props = {
    acceptPatterns: string[];
    folderName: string;
    progress: { name: string; progress: number } | null;
    onFile: (file: File) => void;
};

/** Drop zone and file button. Shows a progress bar while a file uploads. */
export function MediaPickerUploadArea({
    acceptPatterns,
    folderName,
    progress,
    onFile,
}: Props) {
    return (
        <DropZone
            isDisabled={progress !== null}
            onDrop={async (event) => {
                const item = event.items.find(
                    (candidate): candidate is FileDropItem =>
                        candidate.kind === 'file',
                );

                if (item) {
                    onFile(await item.getFile());
                }
            }}
            className={({ isDropTarget }) =>
                cn(
                    'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-base-300 bg-background-soft-50 p-4 transition outline-none',
                    isDropTarget && 'border-primary-500 bg-primary-50',
                )
            }
        >
            {progress ? (
                <div className="flex w-full flex-col gap-2">
                    <p className="text-sm text-title-50">
                        Uploading {progress.name} to {folderName}
                    </p>
                    <Progress
                        progress={progress.progress}
                        withLabel
                        className="max-w-none"
                    />
                </div>
            ) : (
                <>
                    <p className="text-sm text-text-100">
                        Drop a file here to upload it to{' '}
                        <span className="font-medium text-title-50">
                            {folderName}
                        </span>
                    </p>
                    <FileTrigger
                        acceptedFileTypes={
                            acceptPatterns.length > 0
                                ? acceptPatterns
                                : undefined
                        }
                        onSelect={(files) => {
                            const file = files?.[0];

                            if (file) {
                                onFile(file);
                            }
                        }}
                    >
                        <Button variant="primary" appearance="outline">
                            <UploadCloud />
                            Upload file
                        </Button>
                    </FileTrigger>
                </>
            )}
        </DropZone>
    );
}
