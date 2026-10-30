import { NavigationSidebar } from '@ahmcho/tailadmin-react';
import type { NavigationItem, SidebarProps } from '@ahmcho/tailadmin-react';
import { LayoutGrid } from 'lucide-react';
import { dashboard } from '@/routes';

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: dashboard().url,
        icon: <LayoutGrid />,
        end: true,
    },
];

export function AppSidebar(props: SidebarProps) {
    return <NavigationSidebar {...props} items={navigationItems} />;
}
