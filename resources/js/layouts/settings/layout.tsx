import { Card } from '@ahmcho/tailadmin-react';
import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const settingsNavigationItems = [
    {
        title: 'Profile',
        href: edit().url,
    },
    {
        title: 'Security',
        href: editSecurity().url,
    },
    {
        title: 'Appearance',
        href: editAppearance().url,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
                    Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your profile and account settings
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <Card padding="sm" className="h-fit lg:w-56">
                    <nav aria-label="Settings" className="flex flex-col gap-1">
                        {settingsNavigationItems.map((item) => {
                            const isActive = currentPath === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                        isActive
                                            ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
                                    }`}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </Card>

                <div className="min-w-0 flex-1 md:max-w-2xl">{children}</div>
            </div>
        </div>
    );
}
