import { useForm } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { ResourceEditContent } from '@/components/resource/resource-edit-content';
import type {
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
import { edit, index, update } from '@/routes/pages';

type Props = {
    parents: PageParentOption[];
    locales: PageLocaleOption[];
    defaultLocale: string;
    layouts: ContentLayout[];
    elementTypes: ContentElementType[];
    canUseHtml: boolean;
    model: PageFormData & { id: number };
};

export default function Edit({
    model,
    parents,
    locales,
    defaultLocale,
    layouts,
    elementTypes,
    canUseHtml,
}: Props) {
    const editor: ContentEditorConfig = { layouts, elementTypes, canUseHtml };
    const form = useForm<PageFormData>({
        parent_id: model.parent_id,
        status: model.status,
        published_at: model.published_at ?? '',
        layout: model.layout,
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
            <PageFields
                form={form}
                parents={parents}
                locales={locales}
                defaultLocale={defaultLocale}
                editor={editor}
            />
        </ResourceEditContent>
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
