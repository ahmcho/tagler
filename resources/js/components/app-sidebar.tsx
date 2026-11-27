import { Link, router, usePage } from '@inertiajs/react';
import {
    FileText,
    History,
    Images,
    KeyRound,
    LayoutGrid,
    Palette,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/tailgrids/core/sidebar';
import { useAbility } from '@/hooks/use-ability';
import { dashboard } from '@/routes';
import { index as activityLogsIndex } from '@/routes/activity-logs';
import { index as mediaIndex } from '@/routes/media';
import { index as pagesIndex } from '@/routes/pages';
import { index as permissionsIndex } from '@/routes/permissions';
import { index as rolesIndex } from '@/routes/roles';
import { index as themesIndex } from '@/routes/themes';
import { index as usersIndex } from '@/routes/users';
import { cn } from '@/utils/cn';

type NavigationItem = {
    label: string;
    href: string;
    icon: ReactNode;
    end?: boolean;
    ability?: string;
};

type NavigationGroup = {
    label: string;
    items: NavigationItem[];
};

const ungroupedItems: NavigationItem[] = [
    {
        label: 'Dashboard',
        href: dashboard().url,
        icon: <LayoutGrid />,
        end: true,
    },
];

const navigationGroups: NavigationGroup[] = [
    {
        label: 'Content',
        items: [
            {
                label: 'Pages',
                href: pagesIndex.url(),
                icon: <FileText />,
                ability: 'pages.index',
            },
            {
                label: 'Media',
                href: mediaIndex.url(),
                icon: <Images />,
                ability: 'media.index',
            },
        ],
    },
    {
        label: 'Appearance',
        items: [
            {
                label: 'Themes',
                href: themesIndex.url(),
                icon: <Palette />,
                ability: 'themes.index',
            },
        ],
    },
    {
        label: 'RBAC',
        items: [
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
        ],
    },
    {
        label: 'System',
        items: [
            {
                label: 'Users',
                href: usersIndex.url(),
                icon: <Users />,
                ability: 'users.index',
            },
            {
                label: 'Activity log',
                href: activityLogsIndex.url(),
                icon: <History />,
                ability: 'activity-logs.index',
            },
        ],
    },
];

const activeItemClassName =
    'data-[active=true]:bg-primary-500 data-[active=true]:text-white data-[active=true]:hover:bg-primary-500 data-[active=true]:hover:text-white';

const activeSubItemClassName = `${activeItemClassName} data-[active=true]:[&>svg]:text-white`;

/** Base classes of the TailGrids sub-button. The sub-item is an Inertia Link, so it does not use SidebarMenuSubButton. */
const subButtonClassName =
    'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-text-100 ring-primary-500 outline-none hover:bg-background-soft-50 hover:text-text-100 focus-visible:ring-2 active:bg-background-soft-50 active:text-text-100 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-primary-50/10 data-[active=true]:text-primary-500 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-text-100/70';

export function AppSidebar({ name, icon }: { name: string; icon: string }) {
    const pathname = usePage().url.split('?')[0];
    const ability = useAbility();

    const isAllowed = (item: NavigationItem): boolean =>
        item.ability === undefined || ability(item.ability);

    const isActive = (item: NavigationItem): boolean =>
        item.end ? pathname === item.href : pathname.startsWith(item.href);

    const visibleUngroupedItems = ungroupedItems.filter(isAllowed);
    const visibleGroups = navigationGroups
        .map((group) => ({
            ...group,
            items: group.items.filter(isAllowed),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                    <img src={icon} alt="" className="size-8" />
                    <span className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        {name}
                    </span>
                </div>
                <img
                    src={icon}
                    alt=""
                    className="hidden size-8 group-data-[collapsible=icon]:block"
                />
            </SidebarHeader>

            <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2">
                {visibleUngroupedItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleUngroupedItems.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            isActive={isActive(item)}
                                            aria-label={item.label}
                                            tooltip={item.label}
                                            className={activeItemClassName}
                                            onPress={() =>
                                                router.visit(item.href)
                                            }
                                        >
                                            {item.icon}
                                            <span className="group-data-[collapsible=icon]:hidden">
                                                {item.label}
                                            </span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {visibleGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenuSub className="group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:block group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:px-0">
                                {group.items.map((item) => (
                                    <SidebarMenuSubItem key={item.href}>
                                        <Link
                                            href={item.href}
                                            prefetch="hover"
                                            data-sidebar="menu-sub-button"
                                            data-active={isActive(item)}
                                            aria-label={item.label}
                                            title={item.label}
                                            className={cn(
                                                subButtonClassName,
                                                'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                                                activeSubItemClassName,
                                            )}
                                        >
                                            {item.icon}
                                            <span className="group-data-[collapsible=icon]:hidden">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
