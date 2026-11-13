import { router, usePage } from '@inertiajs/react';
import { LogOut, Moon, PanelLeft, Settings, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar';
import { Button } from '@/components/tailgrids/core/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuHeader,
    DropdownMenuItem,
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
            <SidebarTrigger>
                <PanelLeft size={18} />
            </SidebarTrigger>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
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
                        className="flex items-center gap-3"
                    >
                        <Avatar size="md">
                            <AvatarFallback className="bg-primary-500 text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden text-sm font-medium text-text-50 xl:block">
                            {auth.user.name}
                        </span>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        placement="bottom end"
                        className="w-60"
                    >
                        <DropdownMenuHeader className="px-3 py-2">
                            <p className="text-sm font-medium text-title-50">
                                {auth.user.name}
                            </p>
                            <p className="text-xs text-text-100">
                                {auth.user.email}
                            </p>
                        </DropdownMenuHeader>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            id="settings"
                            textValue="Settings"
                            onAction={() => router.visit(edit().url)}
                        >
                            <Settings size={20} />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            id="logout"
                            textValue="Log out"
                            onAction={() => router.post(logout().url)}
                        >
                            <LogOut size={20} />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
