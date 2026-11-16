import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import type { InputActionMeta } from 'react-select';
import type { SearchPage } from '@/hooks/use-search';
import { cn } from '@/utils/cn';

const DEBOUNCE_MS = 500;

export type SelectOption = {
    value: number | string;
    label: string;
};

type SearchableListProps = {
    inputId: string;
    instanceId: string;
    placeholder: string;
    loadingMessage: string;
    noOptionsMessage: string;
    loadOptions: (inputValue: string, page: number) => Promise<SearchPage>;
    value: SelectOption | null;
    onChange: (option: SelectOption | null) => void;
    isClearable?: boolean;
    isDisabled?: boolean;
    hasError?: boolean;
};

/**
 * Debounced, paged async select built on react-select. The menu loads the first page
 * when it opens or when the query changes, and the next page when it is scrolled to the bottom.
 * Styles use the TailGrids look, so this component matches the rest of the UI.
 */
export function SearchableList({
    inputId,
    instanceId,
    placeholder,
    loadingMessage,
    noOptionsMessage,
    loadOptions,
    value,
    onChange,
    isClearable = true,
    isDisabled,
    hasError,
}: SearchableListProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [inputValue, setInputValue] = useState('');
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
                page === 1
                    ? result.options
                    : [
                          ...previous,
                          ...result.options.filter(
                              (option) =>
                                  !previous.some(
                                      (loaded) => loaded.value === option.value,
                                  ),
                          ),
                      ],
            );
        } finally {
            if (requestId === requestRef.current) {
                setIsLoading(false);
            }
        }
    }

    function handleInputChange(query: string, meta: InputActionMeta) {
        setInputValue(query);

        if (meta.action !== 'input-change') {
            return;
        }

        queryRef.current = query;
        setHasMore(false);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadPage(query, 1), DEBOUNCE_MS);
    }

    function handleMenuOpen() {
        if (lastPageRef.current === 0 || queryRef.current !== '') {
            clearTimeout(debounceRef.current);
            queryRef.current = '';
            loadPage('', 1);
        }
    }

    function handleMenuScrollToBottom() {
        if (hasMore && !isLoading) {
            loadPage(queryRef.current, lastPageRef.current + 1);
        }
    }

    return (
        <Select<SelectOption>
            inputId={inputId}
            instanceId={instanceId}
            unstyled
            isClearable={isClearable}
            isDisabled={isDisabled}
            isLoading={isLoading}
            placeholder={placeholder}
            loadingMessage={() => loadingMessage}
            noOptionsMessage={() => noOptionsMessage}
            options={options}
            filterOption={null}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onMenuOpen={handleMenuOpen}
            onMenuScrollToBottom={handleMenuScrollToBottom}
            value={value}
            onChange={(option) => onChange(option)}
            classNames={{
                control: (state) =>
                    cn(
                        'flex min-h-11 w-full items-center rounded-lg border bg-white px-3 text-sm shadow-xs dark:bg-gray-900',
                        hasError
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-700',
                        state.isFocused && 'ring-2 ring-primary-300/50',
                        state.isDisabled && 'opacity-60',
                    ),
                valueContainer: () => 'flex flex-1 items-center gap-2',
                input: () => 'text-gray-800 dark:text-white/90',
                placeholder: () => 'text-gray-400 dark:text-gray-500',
                singleValue: () => 'text-gray-800 dark:text-white/90',
                indicatorsContainer: () => 'flex items-center gap-1',
                clearIndicator: () =>
                    'cursor-pointer px-1 text-gray-400 hover:text-gray-600',
                dropdownIndicator: () => 'hidden',
                loadingIndicator: () => 'px-1 text-gray-400',
                menu: () =>
                    'mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900',
                menuList: () => 'max-h-60 overflow-y-auto',
                option: (state) =>
                    cn(
                        'cursor-pointer px-3 py-2 text-gray-800 dark:text-white/90',
                        state.isFocused && 'bg-gray-100 dark:bg-gray-800',
                        state.isSelected && 'font-medium',
                    ),
                noOptionsMessage: () => 'px-3 py-2 text-gray-500',
                loadingMessage: () => 'px-3 py-2 text-gray-500',
            }}
        />
    );
}
