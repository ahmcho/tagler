import { router, usePage } from '@inertiajs/react';
import {
    History,
    KeyRound,
    Languages,
    LayoutGrid,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/tailgrids/core/sidebar';
import { useAbility } from '@/hooks/use-ability';
import type { BrandImages } from '@/lib/brand';
import { dashboard } from '@/routes';
import { index as activityLogsIndex } from '@/routes/activity-logs';
import { index as permissionsIndex } from '@/routes/permissions';
import { index as rolesIndex } from '@/routes/roles';
import { index as translationsIndex } from '@/routes/translations';
import { index as usersIndex } from '@/routes/users';

type NavigationItem = {
    label: string;
    href: string;
    icon: ReactNode;
    end?: boolean;
    ability?: string;
};

const navigationItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: dashboard().url,
        icon: <LayoutGrid />,
        end: true,
    },
    {
        label: 'Users',
        href: usersIndex.url(),
        icon: <Users />,
        ability: 'users.index',
    },
    {
        label: 'Roles',
        href: rolesIndex.url(),
        icon: <ShieldCheck />,
        ability: 'roles.index',
    },
    {
        label: 'Permissions',
        href: permissionsIndex.url(),
        icon: <KeyRound />,
        ability: 'permissions.index',
    },
    {
        label: 'Activity log',
        href: activityLogsIndex.url(),
        icon: <History />,
        ability: 'activity-logs.index',
    },
    {
        label: 'Translations',
        href: translationsIndex.url(),
        icon: <Languages />,
        ability: 'translations.index',
    },
];

export function AppSidebar({ brand }: { brand: BrandImages }) {
    const pathname = usePage().url.split('?')[0];
    const ability = useAbility();
    const visibleItems = navigationItems.filter(
        (item) => item.ability === undefined || ability(item.ability),
    );

    return (
        <Sidebar>
            <SidebarHeader className="px-4 py-5">
                <img className="h-8 dark:hidden" src={brand.logo} alt="Logo" />
                <img
                    className="hidden h-8 dark:block"
                    src={brand.logoDark}
                    alt="Logo"
                />
            </SidebarHeader>

            <SidebarContent className="px-3">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleItems.map((item) => {
                                const isActive = item.end
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href);

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            onPress={() =>
                                                router.visit(item.href)
                                            }
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
