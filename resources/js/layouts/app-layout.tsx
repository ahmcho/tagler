import { usePage } from '@inertiajs/react';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { FlashToaster } from '@/components/flash-toaster';
import { Breadcrumbs } from '@/components/tailgrids/core/breadcrumbs';
import { SidebarProvider } from '@/components/tailgrids/core/sidebar';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: AppLayoutProps) {
    const { name, favicon } = usePage().props;

    return (
        <SidebarProvider className="h-svh overflow-hidden bg-background-soft-50 dark:bg-gray-900">
            <AppSidebar name={name} icon={favicon} />

            <div className="flex min-w-0 flex-1 flex-col">
                <AppHeader />

                <main className="relative flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6">
                        {breadcrumbs.length > 0 && (
                            <nav aria-label="Breadcrumb" className="mb-6">
                                <Breadcrumbs
                                    dividerType="chevron"
                                    items={breadcrumbs.map((item) => ({
                                        label: item.title,
                                        href: item.href,
                                        icon: item.icon,
                                    }))}
                                />
                            </nav>
                        )}
                        {children}
                    </div>
                </main>
            </div>

            <FlashToaster />
        </SidebarProvider>
    );
}
