import { NavigationSidebar } from '@ahmcho/tailadmin-react';
import type { NavigationItem, SidebarProps } from '@ahmcho/tailadmin-react';
import { Languages, LayoutGrid } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as translationsIndex } from '@/routes/translations';

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: dashboard().url,
        icon: <LayoutGrid />,
        end: true,
    },
    {
        label: 'Translations',
        href: translationsIndex.url(),
        icon: <Languages />,
    },
];

export function AppSidebar(props: SidebarProps) {
    return <NavigationSidebar {...props} items={navigationItems} />;
}
