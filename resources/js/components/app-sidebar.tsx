import { router, usePage } from '@inertiajs/react';
import { Languages, LayoutGrid } from 'lucide-react';
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
import type { BrandImages } from '@/lib/brand';
import { dashboard } from '@/routes';
import { index as translationsIndex } from '@/routes/translations';

type NavigationItem = {
    label: string;
    href: string;
    icon: ReactNode;
    end?: boolean;
};

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

export function AppSidebar({ brand }: { brand: BrandImages }) {
    const pathname = usePage().url.split('?')[0];

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
                            {navigationItems.map((item) => {
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
