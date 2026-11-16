import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { DataTableColumn, DataTableSort } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import {
    Alert,
    AlertContent,
    AlertIndicator,
    AlertTitle,
} from '@/components/tailgrids/core/alert';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import { FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/tailgrids/core/native-select';
import { TextField } from '@/components/tailgrids/core/text-field';
import { edit, index } from '@/routes/translations';

type TranslationRecord = {
    id: number;
    lang: string;
    group: string;
    table: string | null;
    key: string;
    value: string | null;
    updated_at: string;
};

type Filters = {
    group?: string;
    key?: string;
    table?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
};

type Props = {
    records: {
        data: TranslationRecord[];
        current_page: number;
        last_page: number;
        total: number;
    };
    groups: string[];
    tables: string[];
    filters: Filters;
    status?: string | null;
};

const columns: DataTableColumn<TranslationRecord>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'group', header: 'Group', sortable: true },
    { key: 'key', header: 'Key', sortable: true },
    { key: 'value', header: 'Value' },
    { key: 'updated_at', header: 'Updated', sortable: true },
];

export default function Index({
    records,
    groups,
    tables,
    filters,
    status,
}: Props) {
    const [group, setGroup] = useState(filters.group ?? '');
    const [key, setKey] = useState(filters.key ?? '');
    const [isLoading, setIsLoading] = useState(false);

    const currentSort: DataTableSort | null = filters.sort
        ? { key: filters.sort, direction: filters.direction ?? 'asc' }
        : null;

    const visit = (query: Record<string, string | number | undefined>) => {
        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            only: ['records', 'filters', 'status'],
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        visit({
            group: group || undefined,
            key: key || undefined,
            table: filters.table,
            sort: filters.sort,
            direction: filters.direction,
        });
    };

    const clearFilters = () => {
        setGroup('');
        setKey('');
        visit({});
    };

    const changeSort = (sort: DataTableSort | null) => {
        visit({
            ...filters,
            sort: sort?.key,
            direction: sort?.direction,
        });
    };

    return (
        <>
            <Head title="Translations" />

            <div className="space-y-6">
                {status && (
                    <Alert status="success">
                        <AlertIndicator />
                        <AlertContent>
                            <AlertTitle>{status}</AlertTitle>
                        </AlertContent>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Translations
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Edit stored translations for each supported
                                locale. Showing {records.total} entries.
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                appearance={filters.table ? 'outline' : 'fill'}
                                onPress={() =>
                                    visit({
                                        group: filters.group,
                                        key: filters.key,
                                        sort: filters.sort,
                                        direction: filters.direction,
                                    })
                                }
                            >
                                All tables
                            </Button>
                            {tables.map((table) => (
                                <Button
                                    key={table}
                                    size="sm"
                                    appearance={
                                        filters.table === table
                                            ? 'fill'
                                            : 'outline'
                                    }
                                    onPress={() =>
                                        visit({
                                            table,
                                            sort: filters.sort,
                                            direction: filters.direction,
                                        })
                                    }
                                >
                                    {table}
                                </Button>
                            ))}
                        </div>

                        <form
                            onSubmit={submitFilters}
                            className="mb-6 grid gap-4 md:grid-cols-[1fr_2fr_auto]"
                        >
                            <div className="flex w-full flex-col gap-1.5">
                                <FieldLabel htmlFor="translation-group">
                                    Group
                                </FieldLabel>
                                <NativeSelect
                                    id="translation-group"
                                    value={group}
                                    onChange={(event) =>
                                        setGroup(event.target.value)
                                    }
                                >
                                    <NativeSelectOption value="">
                                        All groups
                                    </NativeSelectOption>
                                    {groups.map((item) => (
                                        <NativeSelectOption
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            </div>

                            <TextField
                                value={key}
                                onChange={setKey}
                                className="flex w-full flex-col gap-1.5"
                            >
                                <FieldLabel>Key</FieldLabel>
                                <Input
                                    placeholder="e.g. common.save"
                                    className="w-full"
                                />
                            </TextField>

                            <div className="flex items-end gap-2">
                                <Button type="submit">Search</Button>
                                <Button
                                    type="button"
                                    appearance="outline"
                                    onPress={clearFilters}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>

                        <DataTable
                            caption="Translations"
                            columns={columns}
                            rows={records.data}
                            getRowId={(translation) => translation.id}
                            emptyState="No translations found."
                            isLoading={isLoading}
                            sort={currentSort}
                            onSortChange={changeSort}
                            actionsHeader="Actions"
                            rowActions={(translation) => (
                                <Link
                                    href={edit.url([
                                        translation.group,
                                        translation.key,
                                    ])}
                                    className="text-primary-500 hover:underline"
                                >
                                    Edit
                                </Link>
                            )}
                            pagination={{
                                currentPage: records.current_page,
                                lastPage: records.last_page,
                                onPageChange: (page) =>
                                    visit({ ...filters, page }),
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Translations',
            href: index.url(),
        },
    ],
};
