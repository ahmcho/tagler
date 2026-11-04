import {
    Alert,
    Body,
    Button,
    Card,
    CardBody,
    CardHeader,
    Cell,
    Header,
    Input,
    Pagination,
    Row,
    Select,
    Table,
} from '@ahmcho/tailadmin-react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
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
                {status && <Alert variant="success" title={status} />}

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

                    <CardBody>
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant={filters.table ? 'outline' : 'primary'}
                                onClick={() =>
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
                                    variant={
                                        filters.table === table
                                            ? 'primary'
                                            : 'outline'
                                    }
                                    onClick={() => visit({ table })}
                                >
                                    {table}
                                </Button>
                            ))}
                        </div>

                        <form
                            onSubmit={submitFilters}
                            className="mb-6 grid gap-4 md:grid-cols-[1fr_2fr_auto]"
                        >
                            <Select
                                label="Group"
                                value={group}
                                onChange={(event) =>
                                    setGroup(event.target.value)
                                }
                                options={[
                                    { value: '', label: 'All groups' },
                                    ...groups.map((item) => ({
                                        value: item,
                                        label: item,
                                    })),
                                ]}
                            />
                            <Input
                                label="Key"
                                value={key}
                                placeholder="e.g. common.save"
                                onChange={(event) => setKey(event.target.value)}
                            />
                            <div className="flex items-end gap-2">
                                <Button type="submit" variant="primary">
                                    Search
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    Clear
                                </Button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <Table>
                                <Header>
                                    <Row>
                                        <Cell as="th">ID</Cell>
                                        <Cell as="th">Group</Cell>
                                        <Cell as="th">Key</Cell>
                                        <Cell as="th">Value</Cell>
                                        <Cell as="th">Updated</Cell>
                                        <Cell as="th">Actions</Cell>
                                    </Row>
                                </Header>
                                <Body>
                                    {records.data.length === 0 && (
                                        <Row>
                                            <Cell colSpan={6}>
                                                No translations found.
                                            </Cell>
                                        </Row>
                                    )}
                                    {records.data.map((translation) => (
                                        <Row key={translation.id} hoverable>
                                            <Cell>{translation.id}</Cell>
                                            <Cell>{translation.group}</Cell>
                                            <Cell>{translation.key}</Cell>
                                            <Cell>{translation.value}</Cell>
                                            <Cell>
                                                {translation.updated_at}
                                            </Cell>
                                            <Cell>
                                                <Link
                                                    href={edit.url([
                                                        translation.group,
                                                        translation.key,
                                                    ])}
                                                    className="text-brand-500 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </Cell>
                                        </Row>
                                    ))}
                                </Body>
                            </Table>
                        </div>

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
                    </CardBody>
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
