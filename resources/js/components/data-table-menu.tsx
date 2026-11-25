import { MoreHorizontal } from 'lucide-react';
import type {
    DataTableMenuItem,
    DataTableRowAction,
    DataTableRowId,
} from '@/components/data-table-types';
import { Button } from '@/components/tailgrids/core/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/tailgrids/core/dropdown';
import { cn } from '@/utils/cn';

const menuItemToneClasses = {
    primary: 'text-primary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-error-500',
};

export const menuContentClassName =
    'min-w-46 p-1 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]';

export function isPermitted(
    item: { permission?: string },
    can?: (permission: string) => boolean,
): boolean {
    return !item.permission || !can || can(item.permission);
}

export function DataTableMenuItems({ items }: { items: DataTableMenuItem[] }) {
    return (
        <>
            {items.map((item) => (
                <DropdownMenuItem
                    key={item.key}
                    id={item.key}
                    textValue={item.label}
                    isDisabled={item.isDisabled}
                    onAction={item.onAction}
                    className={cn(
                        'cursor-pointer gap-3 rounded-lg px-3 py-2 data-disabled:cursor-not-allowed data-disabled:opacity-50',
                        item.tone &&
                            item.tone !== 'default' &&
                            menuItemToneClasses[item.tone],
                    )}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </DropdownMenuItem>
            ))}
        </>
    );
}

export function RowActionsMenu<Row>({
    row,
    rowId,
    rowActions,
    can,
}: {
    row: Row;
    rowId: DataTableRowId;
    rowActions: (row: Row) => DataTableRowAction[];
    can?: (permission: string) => boolean;
}) {
    const actions = rowActions(row).filter((action) =>
        isPermitted(action, can),
    );

    if (actions.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <Button
                aria-label={`Actions for row ${String(rowId)}`}
                variant="ghost"
                iconOnly
            >
                <MoreHorizontal className="size-5" />
            </Button>

            <DropdownMenuContent
                placement="bottom end"
                className={menuContentClassName}
            >
                <DataTableMenuItems items={actions} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
