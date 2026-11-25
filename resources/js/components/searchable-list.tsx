import { Close } from '@tailgrids/icons';
import { useEffect, useRef, useState } from 'react';
import type { UIEvent } from 'react';
import {
    Button as AriaButton,
    ComboBox,
    Input as AriaInput,
    ListBox,
    Popover,
} from 'react-aria-components';
import {
    SelectIndicator,
    SelectItem,
} from '@/components/tailgrids/core/select';
import type { SearchPage } from '@/hooks/use-search';
import { cn } from '@/utils/cn';

const DEBOUNCE_MS = 500;
const LOAD_MORE_THRESHOLD_PX = 40;

export type SelectOption = {
    value: number | string;
    label: string;
};

type SearchableListProps = {
    inputId: string;
    placeholder: string;
    loadingMessage: string;
    noOptionsMessage: string;
    loadOptions: (inputValue: string, page: number) => Promise<SearchPage>;
    value: SelectOption | null;
    onChange: (option: SelectOption | null) => void;
    isDisabled?: boolean;
    hasError?: boolean;
};

/** The first page replaces the list. Later pages add only options that are not loaded yet. */
function mergeOptions(
    previous: SelectOption[],
    incoming: SelectOption[],
    page: number,
): SelectOption[] {
    if (page === 1) {
        return incoming;
    }

    const newOptions = incoming.filter(
        (option) => !previous.some((loaded) => loaded.value === option.value),
    );

    return [...previous, ...newOptions];
}

/** The selected option stays in the list, so its label shows even when it is not in the results. */
function withSelectedOption(
    options: SelectOption[],
    value: SelectOption | null,
): SelectOption[] {
    if (
        value === null ||
        options.some((option) => option.value === value.value)
    ) {
        return options;
    }

    return [value, ...options];
}

function isNearBottom(list: HTMLElement): boolean {
    const distanceToBottom =
        list.scrollHeight - list.scrollTop - list.clientHeight;

    return distanceToBottom < LOAD_MORE_THRESHOLD_PX;
}

type SearchableFieldProps = {
    inputId: string;
    placeholder: string;
    hasError?: boolean;
    isDisabled?: boolean;
    canClear: boolean;
    onClear: () => void;
};

/** The input row: the text field, the clear button and the chevron. */
function SearchableField({
    inputId,
    placeholder,
    hasError,
    isDisabled,
    canClear,
    onClear,
}: SearchableFieldProps) {
    return (
        <div
            className={cn(
                'flex min-h-11 w-full items-center gap-2 rounded-lg border border-base-300 bg-input-background px-4 py-2.5 text-title-50 focus-within:border-input-primary-focus-border focus-within:ring-4 focus-within:ring-input-primary-focus-border/20',
                hasError &&
                    'border-input-error-focus-border focus-within:ring-input-error-focus-border/20',
                isDisabled && 'opacity-60',
            )}
        >
            <AriaInput
                id={inputId}
                placeholder={placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-text-100"
            />
            {canClear && (
                <AriaButton
                    slot={null}
                    aria-label="Clear"
                    onPress={onClear}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-100 outline-none hover:text-title-50 focus-visible:ring-2 focus-visible:ring-primary-500 [&>svg]:size-4"
                >
                    <Close />
                </AriaButton>
            )}
            <SelectIndicator />
        </div>
    );
}

type EmptyMessageProps = {
    isLoading: boolean;
    loadingMessage: string;
    noOptionsMessage: string;
};

function EmptyMessage({
    isLoading,
    loadingMessage,
    noOptionsMessage,
}: EmptyMessageProps) {
    return (
        <div className="px-3 py-2 text-sm text-text-100">
            {isLoading ? loadingMessage : noOptionsMessage}
        </div>
    );
}

/**
 * Debounced, paged async combo box built on react-aria. The menu loads the first page
 * when it opens or when the query changes, and the next page when it is scrolled to the bottom.
 * The menu is a react-aria popover, so it renders correctly inside dialogs.
 */
export function SearchableList({
    inputId,
    placeholder,
    loadingMessage,
    noOptionsMessage,
    loadOptions,
    value,
    onChange,
    isDisabled,
    hasError,
}: SearchableListProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [inputValue, setInputValue] = useState(value?.label ?? '');
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadRef = useRef(loadOptions);
    const lastPageRef = useRef(0);
    const queryRef = useRef('');
    const requestRef = useRef(0);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        loadRef.current = loadOptions;
    });

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    async function loadPage(query: string, page: number) {
        const requestId = ++requestRef.current;
        setIsLoading(true);

        try {
            const result = await loadRef.current(query, page);

            if (requestId !== requestRef.current) {
                return;
            }

            lastPageRef.current = page;
            setHasMore(result.hasMore);
            setOptions((previous) =>
                mergeOptions(previous, result.options, page),
            );
        } finally {
            if (requestId === requestRef.current) {
                setIsLoading(false);
            }
        }
    }

    function handleInputChange(query: string) {
        setInputValue(query);
        queryRef.current = query;
        setHasMore(false);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadPage(query, 1), DEBOUNCE_MS);
    }

    function handleMenuOpen() {
        const needsFreshList =
            lastPageRef.current === 0 || queryRef.current !== '';

        if (!needsFreshList) {
            return;
        }

        clearTimeout(debounceRef.current);
        queryRef.current = '';
        loadPage('', 1);
    }

    function handleMenuScroll(event: UIEvent<HTMLDivElement>) {
        if (
            isNearBottom(event.target as HTMLElement) &&
            hasMore &&
            !isLoading
        ) {
            loadPage(queryRef.current, lastPageRef.current + 1);
        }
    }

    function handleClear() {
        setInputValue('');
        onChange(null);
    }

    const items = withSelectedOption(options, value);
    const canClear = value !== null && !isDisabled;

    return (
        <ComboBox<SelectOption>
            items={items}
            selectedKey={value?.value ?? null}
            onSelectionChange={(key) => {
                const option = items.find((item) => item.value === key) ?? null;

                setInputValue(option?.label ?? '');
                onChange(option);
            }}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onOpenChange={(isOpen) => isOpen && handleMenuOpen()}
            menuTrigger="focus"
            defaultFilter={() => true}
            allowsEmptyCollection
            isDisabled={isDisabled}
            isInvalid={hasError}
            aria-label={placeholder}
            className="flex w-full flex-col gap-1.5"
        >
            <SearchableField
                inputId={inputId}
                placeholder={placeholder}
                hasError={hasError}
                isDisabled={isDisabled}
                canClear={canClear}
                onClear={handleClear}
            />
            <Popover
                className="w-(--trigger-width) overflow-auto rounded-xl bg-dropdown-background shadow-md outline-hidden"
                onScrollCapture={handleMenuScroll}
            >
                <ListBox
                    className="max-h-72 overflow-auto p-1 outline-hidden"
                    renderEmptyState={() => (
                        <EmptyMessage
                            isLoading={isLoading}
                            loadingMessage={loadingMessage}
                            noOptionsMessage={noOptionsMessage}
                        />
                    )}
                >
                    {(option: SelectOption) => (
                        <SelectItem id={option.value} textValue={option.label}>
                            {option.label}
                        </SelectItem>
                    )}
                </ListBox>
            </Popover>
        </ComboBox>
    );
}
