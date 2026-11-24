import { File, FileAudio, FileImage, FileText, FileVideo } from 'lucide-react';
import { Badge } from '@/components/tailgrids/core/badge';
import { Card } from '@/components/tailgrids/core/card';
import { formatBytes, formatDate } from '../lib/format';
import type { MediaCategory, MediaRecord } from '../types';

const CATEGORY_ICONS: Record<MediaCategory, typeof File> = {
    pictures: FileImage,
    videos: FileVideo,
    audio: FileAudio,
    documents: FileText,
    other: File,
};

type Props = {
    files: MediaRecord[];
    onOpen: (file: MediaRecord) => void;
};

export function MediaFileGrid({ files, onOpen }: Props) {
    return (
        <section aria-label="Files" className="space-y-3">
            <h2 className="text-sm font-medium text-text-50">Files</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
                {files.map((file) => {
                    const Icon = CATEGORY_ICONS[file.category];

                    return (
                        <li key={file.id}>
                            <Card className="h-full overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => onOpen(file)}
                                    className="flex h-full w-full flex-col text-left focus-visible:outline-2 focus-visible:outline-primary-500"
                                    aria-label={`Open ${file.name}`}
                                >
                                    <div className="flex aspect-[4/3] items-center justify-center bg-gray-50">
                                        {file.thumbnail_url ? (
                                            <img
                                                src={file.thumbnail_url}
                                                alt=""
                                                loading="lazy"
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <Icon className="size-10 text-text-100" />
                                        )}
                                    </div>
                                    <div className="space-y-1 p-3">
                                        <p className="truncate text-sm font-medium text-text-50">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-text-100">
                                            {formatBytes(file.size)} ·{' '}
                                            {formatDate(file.created_at)}
                                        </p>
                                        {file.processing_status !== 'ready' && (
                                            <Badge
                                                color={
                                                    file.processing_status ===
                                                    'failed'
                                                        ? 'error'
                                                        : 'warning'
                                                }
                                            >
                                                {file.processing_status}
                                            </Badge>
                                        )}
                                    </div>
                                </button>
                            </Card>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
