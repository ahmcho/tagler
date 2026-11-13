import type { ComponentProps } from 'react';
import {
    Button,
    Header,
    Menu,
    MenuItem,
    MenuSection,
    MenuTrigger,
    Popover,
    Separator,
} from 'react-aria-components';
import type { MenuSectionProps } from 'react-aria-components';
import type {
    ButtonProps,
    MenuItemProps,
    MenuTriggerProps,
    PopoverProps,
} from 'react-aria-components';
import { cn } from '@/utils/cn';

export function DropdownMenu(props: MenuTriggerProps) {
    return <MenuTrigger {...props} />;
}

export function DropdownMenuTrigger({ className, ...props }: ButtonProps) {
    return <Button className={cn('outline-none', className)} {...props} />;
}

type DropdownContentProps = PopoverProps;

export function DropdownMenuContent({
    children,
    className,
    ...props
}: DropdownContentProps) {
    return (
        <Popover {...props}>
            <Menu
                className={cn(
                    'min-w-40 overflow-clip rounded-xl bg-dropdown-background shadow-md outline-hidden',
                    className,
                )}
            >
                {children}
            </Menu>
        </Popover>
    );
}

type DropdownMenuItemProps = MenuItemProps;

export function DropdownMenuItem({
    className,
    ...props
}: DropdownMenuItemProps) {
    return (
        <MenuItem
            {...props}
            className={cn(
                'group flex w-full cursor-default items-center gap-3 rounded-md px-1.5 py-1 text-sm text-text-50 outline-hidden focus:bg-dropdown-hover-background focus:text-title-50',
                className,
            )}
        />
    );
}

export function DropdownMenuSection<T extends object>({
    className,
    ...props
}: MenuSectionProps<T>) {
    return <MenuSection {...props} className={cn('', className)} />;
}

export function DropdownMenuHeader({
    className,
    ...props
}: ComponentProps<typeof Header>) {
    return (
        <Header
            {...props}
            className={cn('px-3 py-2 text-sm text-text-100', className)}
        />
    );
}

export function DropdownMenuSeparator({
    className,
    ...props
}: ComponentProps<'hr'>) {
    return (
        <Separator
            className={cn(
                'h-px border-none bg-(--border-color-base-100)',
                className,
            )}
            {...props}
        />
    );
}
