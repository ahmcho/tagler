import { Link, useForm } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { ResourceEditContent } from '@/components/resource/resource-edit-content';
import { FieldLabel } from '@/components/tailgrids/core/field';
import type {
    ContentBackground,
    ContentEditorConfig,
    ContentElementType,
    ContentLayout,
} from '@/modules/pages/components/content-document';
import type {
    PageFormData,
    PageLocaleOption,
    PageParentOption,
} from '@/modules/pages/components/page-form';
import { PageFields } from '@/modules/pages/components/page-form';
import { edit, index, preview, update } from '@/routes/pages';

type Revision = {
    id: number;
    created_at: string;
    user: string | null;
};

type LoadedRevision = {
    id: number;
    created_at: string;
} | null;

type Props = {
    parents: PageParentOption[];
    locales: PageLocaleOption[];
    defaultLocale: string;
    layouts: ContentLayout[];
    backgrounds: ContentBackground[];
    elementTypes: ContentElementType[];
    canUseHtml: boolean;
    model: PageFormData & { id: number };
    revisions: Revision[];
    loadedRevision: LoadedRevision;
};

/**
 * The form is keyed by the open revision. Opening another revision gives the
 * form new starting values, so it must remount.
 */
export default function Edit(props: Props) {
    return <EditForm key={props.loadedRevision?.id ?? 'current'} {...props} />;
}

function EditForm({
    model,
    parents,
    locales,
    defaultLocale,
    layouts,
    backgrounds,
    elementTypes,
    canUseHtml,
    revisions,
    loadedRevision,
}: Props) {
    const editor: ContentEditorConfig = {
        layouts,
        backgrounds,
        elementTypes,
        canUseHtml,
    };
    const form = useForm<PageFormData>({
        parent_id: model.parent_id,
        status: model.status,
        publish_date: model.publish_date ?? '',
        publish_time: model.publish_time ?? '',
        layout: model.layout,
        theme_layout: model.theme_layout,
        translations: model.translations,
    });

    const defaultTitle = model.translations[defaultLocale]?.title ?? '';

    return (
        <ResourceEditContent
            pageTitle={`Edit page ${defaultTitle}`}
            model={model}
            form={form}
            storeUrl={null}
            updateUrl={update.url(model.id)}
            resourceName="page"
            backHref={index.url()}
        >
            {loadedRevision && (
                <RevisionNotice
                    pageId={model.id}
                    createdAt={loadedRevision.created_at}
                />
            )}

            <PageFields
                form={form}
                parents={parents}
                locales={locales}
                defaultLocale={defaultLocale}
                editor={editor}
            />

            <PreviewLinks
                pageId={model.id}
                locales={locales}
                translations={model.translations}
            />

            <RevisionList
                pageId={model.id}
                revisions={revisions}
                openRevisionId={loadedRevision?.id ?? null}
            />
        </ResourceEditContent>
    );
}

function RevisionNotice({
    pageId,
    createdAt,
}: {
    pageId: number;
    createdAt: string;
}) {
    return (
        <div
            role="status"
            className="flex flex-col gap-2 rounded-lg border border-base-300 bg-background-50 p-4 text-sm"
        >
            <p className="text-title-50">
                You are editing the version saved on {createdAt}. Nothing has
                changed yet. Save to make this version the current one.
            </p>
            <Link
                href={edit.url(pageId)}
                className="w-fit text-primary-500 hover:underline"
            >
                Discard and show the current version
            </Link>
        </div>
    );
}

/** Previews show the saved version of each locale, not the unsaved form. */
function PreviewLinks({
    pageId,
    locales,
    translations,
}: {
    pageId: number;
    locales: PageLocaleOption[];
    translations: PageFormData['translations'];
}) {
    const savable = locales.filter((locale) => translations[locale.code]?.slug);

    if (savable.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <FieldLabel>Preview the saved version</FieldLabel>
            <div className="flex flex-wrap gap-4 text-sm">
                {savable.map((locale) => (
                    <a
                        key={locale.code}
                        href={preview.url([pageId, locale.code])}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:underline"
                    >
                        {locale.name}
                    </a>
                ))}
            </div>
        </div>
    );
}

function RevisionList({
    pageId,
    revisions,
    openRevisionId,
}: {
    pageId: number;
    revisions: Revision[];
    openRevisionId: number | null;
}) {
    if (revisions.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-2">
            <FieldLabel>History</FieldLabel>
            <ul className="flex flex-col gap-2">
                {revisions.map((revision) => (
                    <li
                        key={revision.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-base-300 px-3 py-2 text-sm"
                    >
                        <span className="text-title-50">
                            {revision.created_at}
                            {revision.user ? ` · ${revision.user}` : ''}
                        </span>
                        {revision.id === openRevisionId ? (
                            <span className="text-title-50">Open now</span>
                        ) : (
                            <Link
                                href={`${edit.url(pageId)}?revision=${revision.id}`}
                                className="text-primary-500 hover:underline"
                            >
                                Open this version
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

Edit.layout = (page: Props) => ({
    breadcrumbs: [
        {
            title: 'Pages',
            href: index.url(),
            icon: <FileText />,
        },
        {
            title: `Edit page ${page.model.translations[page.defaultLocale]?.title ?? ''}`,
            href: edit.url(page.model.id),
        },
    ],
});
