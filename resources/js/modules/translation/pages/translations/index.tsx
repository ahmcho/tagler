import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';
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
import { Pagination } from '@/components/tailgrids/core/pagination';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRoot,
    TableRow,
} from '@/components/tailgrids/core/table';
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

export default function Index({
    records,
    groups,
    tables,
    filters,
    status,
}: Props) {
    const [group, setGroup] = useState(filters.group ?? '');
    const [key, setKey] = useState(filters.key ?? '');

    const visit = (query: Record<string, string | number | undefined>) => {
        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        visit({
            group: group || undefined,
            key: key || undefined,
            table: filters.table,
        });
    };

    const clearFilters = () => {
        setGroup('');
        setKey('');
        visit({});
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
                                    onPress={() => visit({ table })}
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

                        <TableRoot>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Group</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            No translations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {records.data.map((translation) => (
                                    <TableRow
                                        key={translation.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        <TableCell>{translation.id}</TableCell>
                                        <TableCell>
                                            {translation.group}
                                        </TableCell>
                                        <TableCell>{translation.key}</TableCell>
                                        <TableCell>
                                            {translation.value}
                                        </TableCell>
                                        <TableCell>
                                            {translation.updated_at}
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={edit.url([
                                                    translation.group,
                                                    translation.key,
                                                ])}
                                                className="text-primary-500 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </TableRoot>

                        {records.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    currentPage={records.current_page}
                                    totalPages={records.last_page}
                                    onPageChange={(page) =>
                                        visit({ ...filters, page })
                                    }
                                />
                            </div>
                        )}
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
