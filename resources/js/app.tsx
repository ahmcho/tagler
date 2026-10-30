import { TailAdminProvider } from '@ahmcho/tailadmin-react';
import type { LinkComponentProps } from '@ahmcho/tailadmin-react';
import { createInertiaApp, Link, usePage } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import type { ComponentProps } from 'react';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const InertiaLink = ({ href, ...props }: LinkComponentProps) => (
    <Link
        href={href}
        {...(props as Omit<ComponentProps<typeof Link>, 'href'>)}
    />
);

const usePathnameWithoutQuery = (): string => usePage().url.split('?')[0];

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TailAdminProvider
                LinkComponent={InertiaLink}
                usePathname={usePathnameWithoutQuery}
            >
                {app}
            </TailAdminProvider>
        );
    },
    progress: {
        color: '#465FFF',
    },
});

// This will set light / dark mode on load...
initializeTheme();
