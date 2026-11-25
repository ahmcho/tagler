import { Filter, Search1 } from '@tailgrids/icons';
import { MoreVertical } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import {
    DataTableMenuItems,
    menuContentClassName,
} from '@/components/data-table-menu';
import type {
    DataTableBulkAction,
    DataTableFilter,
    DataTableSearch,
    DataTableSelection,
} from '@/components/data-table-types';
import { Button } from '@/components/tailgrids/core/button';
import {
    Dialog,
    DialogBody,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/tailgrids/core/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
} from '@/components/tailgrids/core/dropdown';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';

function DataTableHeading({
    title,
    subtitle,
}: {
    title: ReactNode;
    subtitle: ReactNode;
}) {
    return (
        <div className="min-w-0 break-words">
            {title !== undefined && (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h2>
            )}
            {subtitle !== undefined && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                </div>
            )}
        </div>
    );
}

function DataTableSearchForm({
    search,
    onSubmit,
}: {
    search: DataTableSearch;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <form
            role="search"
            onSubmit={onSubmit}
            className="relative w-full lg:w-72"
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-text-100 [&>svg]:size-5"
            >
                <Search1 />
            </span>
            <TextField
                aria-label={search.label ?? 'Search'}
                value={search.value}
                onChange={search.onChange}
                className="w-full"
            >
                <Input
                    type="search"
                    placeholder={search.placeholder}
                    className="w-full pl-10"
                />
            </TextField>
        </form>
    );
}

/** The Filter button and its dialog. The open state belongs to the table. */
function DataTableFilterControl({
    filter,
    isOpen,
    onOpenChange,
}: {
    filter: DataTableFilter;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <>
            <Button appearance="outline" onPress={() => onOpenChange(true)}>
                <span
                    aria-hidden="true"
                    className="flex items-center [&>svg]:size-4"
                >
                    <Filter />
                </span>
                Filter
                {(filter.activeCount ?? 0) > 0 && (
                    <span className="rounded-full bg-primary-500 px-1.5 text-xs leading-5 font-medium text-white">
                        {filter.activeCount}
                    </span>
                )}
            </Button>

            <Dialog
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                isDismissable
                className="flex max-h-[calc(100dvh-2rem)] flex-col"
            >
                <DialogHeader>
                    <DialogTitle>{filter.title ?? 'Filter'}</DialogTitle>
                    {filter.description && (
                        <DialogDescription>
                            {filter.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <DialogBody className="min-h-0 flex-1 overflow-y-auto">
                    {filter.children}
                </DialogBody>

                <DialogFooter>
                    <Button
                        appearance="outline"
                        onPress={() => {
                            filter.onReset();
                            onOpenChange(false);
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onPress={() => {
                            filter.onApply();
                            onOpenChange(false);
                        }}
                    >
                        Apply
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
}

/** The batch menu for the checked rows. Each action gets the selected ids. */
function DataTableBatchMenu<Row>({
    actions,
    selection,
}: {
    actions: DataTableBulkAction[];
    selection: DataTableSelection<Row>;
}) {
    const selectedCount = selection.selectedIds.size;

    return (
        <>
            {selectedCount > 0 && (
                <span className="text-sm text-text-100">
                    {selectedCount} selected
                </span>
            )}

            <DropdownMenu>
                <Button
                    aria-label="Batch actions"
                    appearance="outline"
                    iconOnly
                >
                    <MoreVertical className="size-5" />
                </Button>

                <DropdownMenuContent
                    placement="bottom end"
                    className={menuContentClassName}
                >
                    <DataTableMenuItems
                        items={actions.map((action) => ({
                            ...action,
                            isDisabled:
                                action.isDisabled || selectedCount === 0,
                            onAction: () =>
                                action.onAction(selection.selectedIds),
                        }))}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export type DataTableToolbarProps<Row> = {
    title: ReactNode;
    subtitle: ReactNode;
    search?: DataTableSearch;
    onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
    filter?: DataTableFilter;
    isFilterOpen: boolean;
    onFilterOpenChange: (open: boolean) => void;
    selection?: DataTableSelection<Row>;
    bulkActions: DataTableBulkAction[];
};

function hasHeading(title: ReactNode, subtitle: ReactNode): boolean {
    return title !== undefined || subtitle !== undefined;
}

/** Heading, search, filter and batch menu. The row above the table. */
export function DataTableToolbar<Row>({
    title,
    subtitle,
    search,
    onSearchSubmit,
    filter,
    isFilterOpen,
    onFilterOpenChange,
    selection,
    bulkActions,
}: DataTableToolbarProps<Row>) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {hasHeading(title, subtitle) && (
                <DataTableHeading title={title} subtitle={subtitle} />
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 lg:ml-auto">
                {search && (
                    <DataTableSearchForm
                        search={search}
                        onSubmit={onSearchSubmit}
                    />
                )}

                {filter && (
                    <DataTableFilterControl
                        filter={filter}
                        isOpen={isFilterOpen}
                        onOpenChange={onFilterOpenChange}
                    />
                )}

                {selection && bulkActions.length > 0 && (
                    <DataTableBatchMenu
                        actions={bulkActions}
                        selection={selection}
                    />
                )}
            </div>
        </div>
    );
}
