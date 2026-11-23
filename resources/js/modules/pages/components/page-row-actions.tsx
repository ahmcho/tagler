import { router } from '@inertiajs/react';
import {
    CircleOff,
    ExternalLink,
    Globe,
    Home,
    Pencil,
    Trash2,
} from 'lucide-react';
import type {
    ResourceActionOptions,
    ResourceRowAction,
} from '@/components/resource/types';
import { destroy, edit, homepage, publish, unpublish } from '@/routes/pages';

export type PageRecord = {
    id: number;
    /** The address of the page in the default locale, or null when the page has no default-locale translation. */
    public_url: string | null;
    title: string | null;
    path: string | null;
    locales: string[];
    status: 'draft' | 'published' | 'scheduled';
    is_homepage: boolean;
    is_live: boolean;
    published_at: string | null;
    updated_at: string | null;
    can: {
        update: boolean;
        delete: boolean;
        publish: boolean;
        setHomepage: boolean;
    };
};

/** Row actions for the page list. Each action passes `onFinish`, so the confirm dialog closes when the request ends, even on failure. */
export function pageRowActions(
    page: PageRecord,
): ResourceRowAction<PageRecord>[] {
    return [
        ...(page.public_url
            ? [
                  {
                      key: 'view-online',
                      label: 'View online',
                      icon: <ExternalLink className="size-4" />,
                      tone: 'primary' as const,
                      onAction: () =>
                          window.open(
                              page.public_url ?? '/',
                              '_blank',
                              'noopener,noreferrer',
                          ),
                  },
              ]
            : []),
        ...(page.can.update
            ? [
                  {
                      key: 'edit',
                      label: 'Edit',
                      icon: <Pencil className="size-4" />,
                      tone: 'success' as const,
                      onAction: () => router.visit(edit.url(page.id)),
                  },
              ]
            : []),
        ...(page.can.publish
            ? [
                  page.status === 'draft'
                      ? {
                            key: 'publish',
                            label: 'Publish',
                            icon: <Globe className="size-4" />,
                            tone: 'primary' as const,
                            onAction: (
                                target: PageRecord,
                                options: ResourceActionOptions,
                            ) =>
                                router.post(
                                    publish.url(target.id),
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: options.onFinish,
                                    },
                                ),
                        }
                      : {
                            key: 'unpublish',
                            label: 'Unpublish',
                            icon: <CircleOff className="size-4" />,
                            tone: 'warning' as const,
                            onAction: (
                                target: PageRecord,
                                options: ResourceActionOptions,
                            ) =>
                                router.post(
                                    unpublish.url(target.id),
                                    {},
                                    {
                                        preserveScroll: true,
                                        onFinish: options.onFinish,
                                    },
                                ),
                        },
              ]
            : []),
        ...(page.can.setHomepage && !page.is_homepage
            ? [
                  {
                      key: 'homepage',
                      label: 'Set as homepage',
                      icon: <Home className="size-4" />,
                      tone: 'primary' as const,
                      onAction: (
                          target: PageRecord,
                          options: ResourceActionOptions,
                      ) =>
                          router.post(
                              homepage.url(target.id),
                              {},
                              {
                                  preserveScroll: true,
                                  onFinish: options.onFinish,
                              },
                          ),
                  },
              ]
            : []),
        ...(page.can.delete
            ? [
                  {
                      key: 'delete',
                      label: 'Delete',
                      icon: <Trash2 className="size-4" />,
                      tone: 'danger' as const,
                      confirm: {
                          title: 'Delete page',
                          description: (target: PageRecord) =>
                              `Delete the page "${target.title}"? Pages below it must be moved or deleted first.`,
                          confirmLabel: 'Delete',
                          icon: <Trash2 />,
                          tone: 'danger' as const,
                      },
                      onAction: (
                          target: PageRecord,
                          options: ResourceActionOptions,
                      ) =>
                          router.delete(destroy.url(target.id), {
                              preserveScroll: true,
                              // Close the dialog on failure too, so the error on the list is visible.
                              onFinish: options.onFinish,
                          }),
                  },
              ]
            : []),
    ];
}
