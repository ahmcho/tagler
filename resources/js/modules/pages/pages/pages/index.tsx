import { router, usePage } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import { useAbility } from '@/hooks/use-ability';
import { LocaleFlag } from '@/modules/pages/components/locale-flag';
import type {
    PageLocaleOption,
    PageStatus,
} from '@/modules/pages/components/page-form';
import { pageRowActions } from '@/modules/pages/components/page-row-actions';
import type { PageRecord } from '@/modules/pages/components/page-row-actions';
import { PageStatusBadge } from '@/modules/pages/components/page-status-badge';
import { create, index } from '@/routes/pages';

type Props = {
    pages: {
        data: PageRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: PageStatus;
        live?: '1' | '0';
        homepage?: '1' | '0';
        publish_date?: string;
        title?: string;
        subtitle?: string;
        slug?: string;
        path?: string;
        sort?: string;
        direction?: 'asc' | 'desc';
    };
    locales: PageLocaleOption[];
    defaultLocale: string;
    status?: string | null;
};

function createColumns(
    localeByCode: Map<string, PageLocaleOption>,
): DataTableColumn<PageRecord>[] {
    return [
        {
            key: 'title',
            header: 'Title',
            accessor: 'title',
            sortable: true,
        },
        {
            key: 'path',
            header: 'Path',
            cell: (page) =>
                page.is_homepage ? '/' : page.path ? `/${page.path}` : '',
        },
        {
            key: 'locales',
            header: 'Languages',
            cell: (page) => (
                <span className="inline-flex items-center gap-2">
                    {page.locales.map((code) => {
                        const locale = localeByCode.get(code);

                        return (
                            <LocaleFlag
                                key={code}
                                country={locale?.country ?? null}
                                label={locale?.name ?? code}
                            />
                        );
                    })}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (page) => <PageStatusBadge status={page.status} />,
        },
        {
            key: 'live',
            header: 'Live',
            cell: (page) => (page.is_live ? 'Yes' : 'No'),
        },
        {
            key: 'homepage',
            header: 'Homepage',
            cell: (page) => (page.is_homepage ? 'Yes' : ''),
        },
        {
            key: 'updated_at',
            header: 'Updated',
            cell: (page) => page.updated_at,
            sortable: true,
        },
    ];
}

/** Errors from row actions (delete, homepage) that the server returns as validation keys. */
const ACTION_ERROR_KEYS = ['delete', 'is_homepage'];

const YES_NO_OPTIONS = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
];

export default function Index({ pages, filters, locales, status }: Props) {
    const ability = useAbility();
    const localeByCode = new Map(
        locales.map((locale) => [locale.code, locale]),
    );
    const columns = createColumns(localeByCode);
    const { errors } = usePage<{ errors: Record<string, string | undefined> }>()
        .props;
    const actionErrors = ACTION_ERROR_KEYS.map((key) => errors[key]).filter(
        (message) => typeof message === 'string' && message !== '',
    );

    return (
        <ResourcePage title="Pages" status={status}>
            {actionErrors.map((message) => (
                <Alert key={message} status="error" className="max-w-none">
                    <AlertIndicator />
                    <AlertContent>
                        <AlertTitle>{message}</AlertTitle>
                    </AlertContent>
                </Alert>
            ))}

            <ResourceIndexContent<PageRecord>
                caption="Pages"
                subtitle={
                    ability('pages.store') ? (
                        <Button onPress={() => router.visit(create.url())}>
                            <Plus className="size-4" />
                            New page
                        </Button>
                    ) : undefined
                }
                indexUrl={index.url()}
                dataKey="pages"
                query={filters}
                pagination={{
                    currentPage: pages.current_page,
                    lastPage: pages.last_page,
                    total: pages.total,
                }}
                rows={pages.data}
                columns={columns}
                getRowId={(page) => page.id}
                emptyState="No pages yet."
                filters={{
                    title: 'Filter pages',
                    description:
                        'Show only pages that match these values. Text filters match part of the value.',
                    fields: [
                        {
                            type: 'select',
                            name: 'status',
                            label: 'Status',
                            allLabel: 'All statuses',
                            options: [
                                { value: 'draft', label: 'Draft' },
                                { value: 'published', label: 'Published' },
                                { value: 'scheduled', label: 'Scheduled' },
                            ],
                        },
                        {
                            type: 'select',
                            name: 'live',
                            label: 'Live',
                            allLabel: 'Any',
                            options: YES_NO_OPTIONS,
                        },
                        {
                            type: 'select',
                            name: 'homepage',
                            label: 'Homepage',
                            allLabel: 'Any',
                            options: YES_NO_OPTIONS,
                        },
                        {
                            type: 'daterange',
                            name: 'publish_date',
                            label: 'Publish date',
                        },
                        { type: 'text', name: 'title', label: 'Title' },
                        { type: 'text', name: 'subtitle', label: 'Subtitle' },
                        { type: 'text', name: 'slug', label: 'Slug' },
                        { type: 'text', name: 'path', label: 'Path' },
                    ],
                }}
                rowActions={(page) => pageRowActions(page)}
            />
        </ResourcePage>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Pages',
            href: index.url(),
            icon: <FileText />,
        },
    ],
};
