import { useForm } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { ResourceCreateContent } from '@/components/resource/resource-create-content';
import type {
    PageFormData,
    PageLocaleOption,
    PageParentOption,
} from '@/modules/pages/components/page-form';
import { PageFields } from '@/modules/pages/components/page-form';
import { create, index, store } from '@/routes/pages';

type Props = {
    parents: PageParentOption[];
    locales: PageLocaleOption[];
    defaultLocale: string;
    model: PageFormData & { id: null };
};

export default function Create({
    model,
    parents,
    locales,
    defaultLocale,
}: Props) {
    const form = useForm<PageFormData>({
        parent_id: model.parent_id,
        status: model.status,
        publish_date: model.publish_date ?? '',
        publish_time: model.publish_time ?? '',
        layout: model.layout,
        theme_layout: model.theme_layout,
        translations: model.translations,
    });

    return (
        <ResourceCreateContent
            pageTitle="New page"
            model={model}
            form={form}
            storeUrl={store.url()}
            updateUrl={null}
            resourceName="page"
            backHref={index.url()}
        >
            <PageFields
                form={form}
                parents={parents}
                locales={locales}
                defaultLocale={defaultLocale}
            />
        </ResourceCreateContent>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Pages',
            href: index.url(),
            icon: <FileText />,
        },
        {
            title: 'New page',
            href: create.url(),
        },
    ],
};
