import {
    Dropdown,
    DropdownDivider,
    DropdownItem,
} from '@ahmcho/tailadmin-react';
import type { BrandImages } from '@ahmcho/tailadmin-react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LogOut,
    Menu,
    MoreHorizontal,
    Moon,
    Settings,
    Sun,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import { dashboard, logout } from '@/routes';
import { edit } from '@/routes/profile';

type AppHeaderProps = {
    sidebarToggle: boolean;
    setSidebarToggle: (value: boolean) => void;
    brand: BrandImages;
};

export function AppHeader({
    sidebarToggle,
    setSidebarToggle,
    brand,
}: AppHeaderProps) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [menuToggle, setMenuToggle] = useState<boolean>(false);

    return (
        <header className="sticky top-0 z-[99999] flex w-full border-gray-200 bg-white xl:border-b dark:border-gray-800 dark:bg-gray-900">
            <div className="flex grow flex-col items-center justify-between xl:flex-row xl:px-6">
                <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:py-4 xl:justify-normal xl:border-b-0 xl:px-0 dark:border-gray-800">
                    <button
                        type="button"
                        aria-label="Toggle sidebar"
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 xl:h-11 xl:w-11 xl:border dark:border-gray-800 dark:text-gray-400 ${sidebarToggle ? 'bg-gray-100 xl:bg-transparent dark:bg-gray-800' : ''}`}
                        onClick={() => setSidebarToggle(!sidebarToggle)}
                    >
                        <Menu className="hidden xl:block" size={20} />
                        {sidebarToggle ? (
                            <X className="block xl:hidden" size={24} />
                        ) : (
                            <Menu className="block xl:hidden" size={24} />
                        )}
                    </button>

                    <Link href={dashboard().url} className="xl:hidden">
                        <img
                            className="dark:hidden"
                            src={brand.logo}
                            alt="Logo"
                        />
                        <img
                            className="hidden dark:block"
                            src={brand.logoDark}
                            alt="Logo"
                        />
                    </Link>

                    <button
                        type="button"
                        aria-label="Toggle menu"
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 xl:hidden dark:text-gray-400 dark:hover:bg-gray-800 ${menuToggle ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        onClick={() => setMenuToggle(!menuToggle)}
                    >
                        <MoreHorizontal size={24} />
                    </button>
                </div>

                <div
                    className={`w-full items-center justify-between gap-4 px-5 py-4 shadow-theme-md xl:flex xl:justify-end xl:px-0 xl:shadow-none ${menuToggle ? 'flex' : 'hidden'}`}
                >
                    <div className="flex items-center gap-2 2xsm:gap-3">
                        <button
                            type="button"
                            aria-label="Toggle dark mode"
                            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                            onClick={() =>
                                updateAppearance(
                                    resolvedAppearance === 'dark'
                                        ? 'light'
                                        : 'dark',
                                )
                            }
                        >
                            <Moon size={20} className="dark:hidden" />
                            <Sun size={20} className="hidden dark:block" />
                        </button>
                    </div>

                    <Dropdown
                        align="end"
                        width={240}
                        trigger={
                            <span className="flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                                    {getInitials(auth.user.name)}
                                </span>
                                <span className="hidden text-sm font-medium text-gray-700 xl:block dark:text-gray-400">
                                    {auth.user.name}
                                </span>
                            </span>
                        }
                    >
                        <div className="px-3 py-2">
                            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                {auth.user.name}
                            </p>
                            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                                {auth.user.email}
                            </p>
                        </div>
                        <DropdownDivider />
                        <DropdownItem
                            icon={<Settings size={20} />}
                            onClick={() => router.visit(edit().url)}
                        >
                            Settings
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem
                            icon={<LogOut size={20} />}
                            onClick={() => router.post(logout().url)}
                        >
                            Log out
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
