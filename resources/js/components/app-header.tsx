import { router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    LogOut,
    Moon,
    PanelLeft,
    Settings,
    Sun,
} from 'lucide-react';
import { Button } from '@/components/tailgrids/core/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuHeader,
    DropdownMenuItem,
    DropdownMenuSection,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/tailgrids/core/dropdown';
import { SidebarTrigger } from '@/components/tailgrids/core/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';

export function AppHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between gap-3 border-b border-base-200 bg-background-100 px-4 dark:border-gray-800 dark:bg-gray-900">
            <SidebarTrigger className="size-10 rounded-lg">
                <PanelLeft size={18} />
            </SidebarTrigger>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    iconOnly
                    aria-label="Toggle dark mode"
                    onPress={() =>
                        updateAppearance(
                            resolvedAppearance === 'dark' ? 'light' : 'dark',
                        )
                    }
                >
                    <Moon size={20} className="dark:hidden" />
                    <Sun size={20} className="hidden dark:block" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label="Account menu"
                        className="group flex h-10 items-center gap-2 rounded-full border border-base-200 bg-background-50 px-4 text-sm font-medium text-title-50 shadow-sm transition-all hover:bg-background-soft-50 focus-visible:bg-background-soft-50"
                    >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-tr from-white-100 to-button-primary-background text-[10px] text-white-100">
                            {getInitials(auth.user.name)}
                        </div>
                        {auth.user.name}
                        <ChevronDown className="size-4 text-text-200 transition-transform group-data-[state=open]:rotate-180" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        placement="bottom end"
                        className="min-h-30 min-w-56 p-1.5"
                    >
                        <DropdownMenuSection>
                            <DropdownMenuHeader>
                                <p className="text-sm font-medium text-title-50">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-text-100">
                                    {auth.user.email}
                                </p>
                            </DropdownMenuHeader>
                            <DropdownMenuItem
                                id="settings"
                                textValue="Settings"
                                className="cursor-pointer gap-2.5 py-2"
                                onAction={() => router.visit(edit().url)}
                            >
                                <Settings className="size-5" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                        </DropdownMenuSection>
                        <DropdownMenuSeparator className="-mx-1.5 my-1" />
                        <DropdownMenuItem
                            id="logout"
                            textValue="Log out"
                            className="cursor-pointer gap-2.5 py-2 text-error-500 focus:bg-alert-danger-background focus:text-alert-danger-title"
                            onAction={() => router.post(logout().url)}
                        >
                            <LogOut className="size-5" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
