import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import type { ComponentType } from 'react';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob<{ default: ComponentType }>([
    './pages/**/*.tsx',
    './modules/*/pages/**/*.tsx',
]);

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const matches = Object.keys(pages).filter((path) =>
            path.endsWith(`/pages/${name}.tsx`),
        );

        if (matches.length !== 1) {
            throw new Error(
                `Page "${name}" matched ${matches.length} files. Each page name must be unique.`,
            );
        }

        return (await pages[matches[0]]()).default;
    },
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
    progress: {
        color: '#3758f9',
    },
});

// This will set light / dark mode on load...
initializeTheme();
