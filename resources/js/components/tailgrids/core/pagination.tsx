'use client';

import { ArrowLeft, ArrowRight } from '@tailgrids/icons';
import { cva } from 'class-variance-authority';
import type { FormEvent } from 'react';
import { useId, useState } from 'react';
import { cn } from '@/utils/cn';
import { Button } from './button';

const wrapperStyles = cva(
    'mx-auto flex w-full items-center justify-center max-sm:gap-5',
    {
        variants: {
            variant: {
                default: 'gap-0.5',
                compact:
                    'max-w-fit sm:divide-x sm:divide-button-outline-border',
            },
        },
    },
);

const sideButtonStyles = cva('max-sm:size-10 sm:h-10', {
    variants: {
        sideLayout: {
            full: 'py-2 pr-4 pl-3.5',
            label: 'px-4 py-2',
            icon: 'p-2',
        },
        variant: {
            default: '',
            compact: '',
        },
    },
});

type PropsType = {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
    variant?: 'default' | 'compact';
    sideLayout?: 'full' | 'label' | 'icon';
};

const PAGE_RANGE_SIZE = 10;
const WINDOW_RADIUS = 2;
const EDGE_PAGE_COUNT = 2;

type PaginationItem = number | 'ellipsis';

function getPageRange(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Builds the visible page list. Gaps of one or more pages become an ellipsis.
 */
export function getPaginationItems(
    currentPage: number,
    totalPages: number,
): PaginationItem[] {
    if (totalPages <= PAGE_RANGE_SIZE) {
        return getPageRange(1, totalPages);
    }

    const lastRangeStart = totalPages - PAGE_RANGE_SIZE + 1;
    const lastEdgeStart = totalPages - EDGE_PAGE_COUNT + 1;
    const edgePages = getPageRange(1, EDGE_PAGE_COUNT);

    let pages: number[];

    if (currentPage <= PAGE_RANGE_SIZE) {
        pages = [
            ...getPageRange(1, PAGE_RANGE_SIZE),
            ...getPageRange(lastEdgeStart, totalPages),
        ];
    } else if (currentPage >= lastRangeStart) {
        pages = [...edgePages, ...getPageRange(lastRangeStart, totalPages)];
    } else {
        pages = [
            ...edgePages,
            ...getPageRange(
                currentPage - WINDOW_RADIUS,
                currentPage + WINDOW_RADIUS,
            ),
            ...getPageRange(lastEdgeStart, totalPages),
        ];
    }

    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);

    return uniquePages.reduce<PaginationItem[]>((items, page, index) => {
        if (index > 0 && page - uniquePages[index - 1] > 1) {
            items.push('ellipsis');
        }

        items.push(page);

        return items;
    }, []);
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    variant = 'default',
    sideLayout = 'full',
}: PropsType) {
    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className="w-full text-sm font-medium text-text-50"
        >
            <ul className={wrapperStyles({ variant })}>
                <li className="mr-auto">
                    <Button
                        appearance="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        onClick={() => onPageChange?.(currentPage - 1)}
                        className={cn(
                            sideButtonStyles({ sideLayout, variant }),
                            {
                                'sm:rounded-r-none sm:border-r-0':
                                    variant === 'compact',
                            },
                        )}
                    >
                        <ArrowLeft
                            className={cn(
                                'shrink-0',
                                sideLayout === 'label' && 'sm:hidden',
                            )}
                        />

                        {sideLayout !== 'icon' && (
                            <span className="max-sm:hidden">Previous</span>
                        )}
                    </Button>
                </li>

                {/* Only for mobile view */}
                <li className="sm:hidden">
                    Page {currentPage} of {totalPages}
                </li>

                {getPaginationItems(currentPage, totalPages).map(
                    (item, index) =>
                        item === 'ellipsis' ? (
                            <li
                                key={`ellipsis-${index}`}
                                className="max-sm:hidden"
                            >
                                <PaginationEllipsis
                                    paginationVariant={variant}
                                />
                            </li>
                        ) : (
                            <li key={item} className="max-sm:hidden">
                                <PaginationButton
                                    page={item}
                                    isActive={currentPage === item}
                                    onPageChange={onPageChange}
                                    paginationVariant={variant}
                                />
                            </li>
                        ),
                )}

                {totalPages > PAGE_RANGE_SIZE && (
                    <li className="mx-2 max-sm:hidden">
                        <GoToPage
                            key={currentPage}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                        />
                    </li>
                )}

                <li className="ml-auto">
                    <Button
                        size="sm"
                        appearance="outline"
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        onClick={() => onPageChange?.(currentPage + 1)}
                        className={cn(
                            sideButtonStyles({ sideLayout, variant }),
                            {
                                'sm:rounded-l-none sm:border-l-0':
                                    variant === 'compact',
                            },
                        )}
                    >
                        {sideLayout !== 'icon' && (
                            <span className="max-sm:hidden">Next</span>
                        )}

                        <ArrowRight
                            className={cn(
                                'shrink-0',
                                sideLayout === 'label' && 'sm:hidden',
                            )}
                        />
                    </Button>
                </li>
            </ul>
        </nav>
    );
}

function GoToPage({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
}) {
    const [draftPage, setDraftPage] = useState('');
    const inputId = useId();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const requestedPage = Number(draftPage);
        const isValidPage =
            Number.isInteger(requestedPage) &&
            requestedPage >= 1 &&
            requestedPage <= totalPages &&
            requestedPage !== currentPage;

        if (isValidPage) {
            onPageChange?.(requestedPage);
        }

        setDraftPage('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label htmlFor={inputId} className="whitespace-nowrap">
                Go to page
            </label>
            <input
                id={inputId}
                type="number"
                min={1}
                max={totalPages}
                value={draftPage}
                onChange={(event) => setDraftPage(event.target.value)}
                className="h-10 w-20 rounded-lg border border-button-outline-border bg-button-outline-background px-2 text-center text-text-100 outline-none focus:ring-3 focus:ring-button-outline-focus-ring"
            />
            <Button type="submit" size="sm" appearance="outline">
                Go
            </Button>
        </form>
    );
}

function PaginationButton({
    page,
    isActive,
    onPageChange,
    paginationVariant,
}: {
    page: number;
    isActive: boolean;
    onPageChange?: (page: number) => void;
    paginationVariant: PropsType['variant'];
}) {
    return (
        <button
            aria-label={`Go to page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'size-10 shrink-0 rounded-lg hover:bg-background-soft-100 aria-[current=page]:bg-background-soft-100',
                paginationVariant === 'compact' &&
                    'rounded-none border-y border-button-outline-border bg-button-outline-background',
            )}
            onClick={() => onPageChange?.(page)}
        >
            {page}
        </button>
    );
}

function PaginationEllipsis({
    paginationVariant,
}: {
    paginationVariant: PropsType['variant'];
}) {
    return (
        <button
            className={cn('pointer-events-none size-10 shrink-0', {
                'border-y border-button-outline-border bg-button-outline-background':
                    paginationVariant === 'compact',
            })}
        >
            ...
        </button>
    );
}
