import { router } from '@inertiajs/react';
import { Palette, Check } from 'lucide-react';
import type { DataTableColumn } from '@/components/data-table';
import { ResourceIndexContent } from '@/components/resource/resource-index-content';
import { ResourcePage } from '@/components/resource/resource-page';
import type { ResourceRowAction } from '@/components/resource/types';
import { Badge } from '@/components/tailgrids/core/badge';
import { useAbility } from '@/hooks/use-ability';
import { activate, index } from '@/routes/themes';

type ThemeRecord = {
    slug: string;
    name: string;
    version: string;
    description: string | null;
    author: string | null;
    templates: string[];
    active: boolean;
};

type Props = {
    themes: ThemeRecord[];
    status?: string | null;
};

const columns: DataTableColumn<ThemeRecord>[] = [
    {
        key: 'name',
        header: 'Name',
        cell: (theme) => (
            <span className="flex flex-col">
                <span className="font-medium">{theme.name}</span>
                <span className="text-xs text-title-50">{theme.slug}</span>
            </span>
        ),
    },
    {
        key: 'version',
        header: 'Version',
        accessor: 'version',
    },
    {
        key: 'templates',
        header: 'Templates',
        cell: (theme) => theme.templates.join(', '),
    },
    {
        key: 'status',
        header: 'Status',
        cell: (theme) =>
            theme.active ? (
                <Badge
                    color="success"
                    prefixIcon={<Check className="size-3" />}
                >
                    Active
                </Badge>
            ) : (
                'Inactive'
            ),
    },
];

function activateAction(): ResourceRowAction<ThemeRecord> {
    return {
        key: 'activate',
        label: 'Activate',
        icon: <Palette className="size-4" />,
        tone: 'primary',
        confirm: {
            title: 'Activate theme',
            description: (target) =>
                `Make "${target.name}" the theme of the public site? The homepage changes at once.`,
            confirmLabel: 'Activate',
            icon: <Palette className="size-4" />,
        },
        onAction: (target, { onFinish }) =>
            router.post(
                activate.url(target.slug),
                {},
                { preserveScroll: true, onFinish },
            ),
    };
}

export default function Index({ themes, status }: Props) {
    const ability = useAbility();

    return (
        <ResourcePage title="Themes" status={status}>
            <ResourceIndexContent<ThemeRecord>
                caption="Themes"
                indexUrl={index.url()}
                dataKey="themes"
                query={{}}
                pagination={{
                    currentPage: 1,
                    lastPage: 1,
                    total: themes.length,
                }}
                rows={themes}
                columns={columns}
                getRowId={(theme) => theme.slug}
                emptyState="No themes are installed."
                rowActions={(theme) =>
                    ability('themes.activate') && !theme.active
                        ? [activateAction()]
                        : []
                }
            />
        </ResourcePage>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Themes',
            href: index.url(),
            icon: <Palette />,
        },
    ],
};
