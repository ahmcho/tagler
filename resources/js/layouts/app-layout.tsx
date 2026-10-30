import { Breadcrumb } from '@ahmcho/tailadmin-react';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { brandImages } from '@/lib/brand';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: AppLayoutProps) {
    const { name } = usePage().props;
    const [sidebarToggle, setSidebarToggle] = useState(false);
    const brand = brandImages(name);

    return (
        <div className="flex h-screen overflow-hidden dark:bg-gray-900">
            <AppSidebar
                sidebarToggle={sidebarToggle}
                setSidebarToggle={setSidebarToggle}
                brand={brand}
            />
            <div className="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                {sidebarToggle && (
                    <div
                        className="fixed inset-0 z-10 h-screen w-full bg-gray-900/50 xl:hidden"
                        onClick={() => setSidebarToggle(false)}
                    />
                )}
                <AppHeader
                    sidebarToggle={sidebarToggle}
                    setSidebarToggle={setSidebarToggle}
                    brand={brand}
                />
                <main>
                    <div className="mx-auto max-w-screen-2xl p-4 pb-20 md:p-6 md:pb-6">
                        {breadcrumbs.length > 0 && (
                            <Breadcrumb
                                className="mb-6"
                                items={breadcrumbs.map((item, index) => ({
                                    label: item.title,
                                    href: item.href,
                                    active: index === breadcrumbs.length - 1,
                                }))}
                            />
                        )}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
