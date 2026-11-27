import { Images } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ResourcePage } from '@/components/resource/resource-page';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';
import { useAbility } from '@/hooks/use-ability';
import { libraryPageUrl } from '@/modules/media/api/media-api';
import { MediaDetailsSheet } from '@/modules/media/components/media-details-sheet';
import {
    MediaFileTable,
    MediaFileTableSkeleton,
} from '@/modules/media/components/media-file-table';
import { MediaFolderGrid } from '@/modules/media/components/media-folder-grid';
import { MediaStorageDonut } from '@/modules/media/components/media-storage-donut';
import { MediaUploadAction } from '@/modules/media/components/media-toolbar';
import { useMediaLibrary } from '@/modules/media/hooks/use-media-library';
import { childFolders } from '@/modules/media/lib/format';
import type { MediaUploadLimits } from '@/modules/media/types';
import { index as mediaIndex } from '@/routes/media';

type Props = {
    upload: MediaUploadLimits;
    quotaBytes: number | null;
};

const RECENT_LIMIT = 6;

/**
 * The file manager dashboard. It shows summaries only. The View All links open the library in a new tab.
 */
export default function MediaIndex({ upload }: Props) {
    const ability = useAbility();
    const library = useMediaLibrary({
        folder: 'all',
        sort: 'created_desc',
        perPage: RECENT_LIMIT,
    });
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { files, folders, usage } = library;
    const selected = files?.data.find((file) => file.id === selectedId) ?? null;
    const rootFolders = childFolders(folders, 'root');
    // A failed request keeps its error alert, so the placeholders stop there.
    const filesLoading = library.loading && !library.error;
    const summaryLoading = usage === null && !library.error;

    const abilities = {
        update: ability('media.update'),
        visibility: ability('media.visibility'),
        destroy: ability('media.destroy'),
        purge: ability('media.purge'),
    };

    return (
        <ResourcePage title="File Manager">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold text-title-50">
                        File Manager
                    </h1>
                    <MediaUploadAction
                        limits={upload}
                        folder="root"
                        canUpload={ability('media.store')}
                        onUploaded={() => library.refresh()}
                    />
                </div>

                {library.error && (
                    <Alert status="error" className="max-w-none">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{library.error}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <Card className="gap-0 rounded-2xl border border-base-200 bg-card-background-50 xl:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-base-100/60 p-6">
                            <CardTitle className="text-lg md:text-lg">
                                All Folders
                            </CardTitle>
                            <ViewAllLink />
                        </CardHeader>
                        <CardContent className="p-6">
                            <MediaFolderGrid
                                folders={rootFolders}
                                loading={summaryLoading}
                                onOpen={(folder) =>
                                    window.open(
                                        libraryPageUrl({ folder: folder.id }),
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }
                            />
                        </CardContent>
                    </Card>

                    <MediaStorageDonut
                        usage={usage}
                        loading={summaryLoading}
                        onRefresh={() => library.refresh()}
                    />
                </div>

                <Card className="gap-0 rounded-2xl border border-base-200 bg-card-background-50">
                    <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-base-100/60 p-6">
                        <CardTitle className="text-lg md:text-lg">
                            Recent Files
                        </CardTitle>
                        <ViewAllLink />
                    </CardHeader>
                    <CardContent className="p-0">
                        {filesLoading ? (
                            <div className="overflow-x-auto">
                                <MediaFileTableSkeleton rows={RECENT_LIMIT} />
                            </div>
                        ) : files && files.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <MediaFileTable
                                    files={files.data}
                                    onOpen={(file) => setSelectedId(file.id)}
                                />
                            </div>
                        ) : files ? (
                            <p className="p-6 text-center text-sm text-text-100">
                                No files yet. Upload files to start.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <MediaDetailsSheet
                    file={selected}
                    folders={folders}
                    abilities={abilities}
                    inTrash={false}
                    onClose={() => setSelectedId(null)}
                    onChanged={(updated) => library.replaceFile(updated)}
                    onRemoved={(uuid) => {
                        library.removeFile(uuid);
                        setSelectedId(null);
                        library.refresh();
                    }}
                    onStructureChanged={() => library.refresh()}
                />
            </div>
        </ResourcePage>
    );
}

/** The design's "View All" link. It opens the library in a new tab. */
function ViewAllLink() {
    return (
        <a
            href={libraryPageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-100 hover:text-title-50"
        >
            View All
            <ArrowRight className="size-4" />
        </a>
    );
}

MediaIndex.layout = {
    breadcrumbs: [
        {
            title: 'File Manager',
            href: mediaIndex.url(),
            icon: <Images />,
        },
    ],
};
