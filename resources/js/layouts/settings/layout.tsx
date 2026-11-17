import { router, usePage } from '@inertiajs/react';
import { Palette, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import {
    TabContent,
    TabList,
    TabRoot,
    TabTrigger,
} from '@/components/tailgrids/core/tabs';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const settingsNavigationItems = [
    {
        value: 'profile',
        title: 'Profile',
        href: edit().url,
        icon: UserRound,
    },
    {
        value: 'security',
        title: 'Security',
        href: editSecurity().url,
        icon: ShieldCheck,
    },
    {
        value: 'appearance',
        title: 'Appearance',
        href: editAppearance().url,
        icon: Palette,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const activeItem =
        settingsNavigationItems.find((item) => item.href === currentPath) ??
        settingsNavigationItems[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90">
                    Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your profile and account settings
                </p>
            </div>

            <TabRoot
                key={activeItem.href}
                direction="horizontal"
                defaultValue={activeItem.value}
                className="gap-10 border-0 p-0"
            >
                <TabList>
                    {settingsNavigationItems.map((item) => (
                        <TabTrigger
                            key={item.value}
                            value={item.value}
                            icon={<item.icon />}
                            onClick={() => router.visit(item.href)}
                        >
                            {item.title}
                        </TabTrigger>
                    ))}
                </TabList>

                <TabContent value={activeItem.value} className="min-w-0 flex-1">
                    {children}
                </TabContent>
            </TabRoot>
        </div>
    );
}
