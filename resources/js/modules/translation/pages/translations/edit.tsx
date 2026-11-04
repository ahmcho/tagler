import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
} from '@ahmcho/tailadmin-react';
import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { index, update } from '@/routes/translations';

type Locale = {
    code: string;
    name: string;
};

type Props = {
    group: string;
    translationKey: string;
    locales: Locale[];
    values: Record<string, string | null>;
};

export default function Edit({
    group,
    translationKey,
    locales,
    values,
}: Props) {
    const form = useForm<{ translations: Record<string, string> }>({
        translations: Object.fromEntries(
            locales.map((locale) => [locale.code, values[locale.code] ?? '']),
        ),
    });

    const setValue = (code: string, value: string) => {
        form.setData('translations', {
            ...form.data.translations,
            [code]: value,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(update.url([group, translationKey]));
    };

    return (
        <>
            <Head title={`Edit ${group}.${translationKey}`} />

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Edit translation
                            </h2>
                            <p className="font-mono text-sm text-gray-500 dark:text-gray-400">
                                {group}.{translationKey}
                            </p>
                        </div>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={submit} className="space-y-4">
                            {locales.map((locale) => (
                                <Input
                                    key={locale.code}
                                    label={locale.name}
                                    value={
                                        form.data.translations[locale.code] ??
                                        ''
                                    }
                                    error={
                                        form.errors[
                                            `translations.${locale.code}`
                                        ]
                                    }
                                    onChange={(event) =>
                                        setValue(
                                            locale.code,
                                            event.target.value,
                                        )
                                    }
                                />
                            ))}

                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit(index.url())}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={form.processing}
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Translations',
            href: index.url(),
        },
    ],
};
