import { useForm } from '@inertiajs/react';
import { ResourceEditContent } from '@/components/resource/resource-edit-content';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import { TextField } from '@/components/tailgrids/core/text-field';
import { index, update } from '@/routes/translations';

type Locale = {
    code: string;
    name: string;
};

type Props = {
    /** Translations have no numeric id. The `group.key` string stands in for it, so the form always updates. */
    model: { id: string };
    group: string;
    translationKey: string;
    locales: Locale[];
    values: Record<string, string | null>;
};

type TranslationFormData = {
    translations: Record<string, string>;
};

export default function Edit({
    model,
    group,
    translationKey,
    locales,
    values,
}: Props) {
    const form = useForm<TranslationFormData>({
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

    return (
        <ResourceEditContent
            pageTitle={`Edit ${group}.${translationKey}`}
            model={model}
            form={form}
            storeUrl={null}
            updateUrl={update.url([group, translationKey])}
            resourceName="translation"
            description={
                <span className="font-mono">
                    {group}.{translationKey}
                </span>
            }
            backHref={index.url()}
        >
            {locales.map((locale) => (
                <TextField
                    key={locale.code}
                    value={form.data.translations[locale.code] ?? ''}
                    onChange={(value) => setValue(locale.code, value)}
                    invalid={Boolean(
                        form.errors[`translations.${locale.code}`],
                    )}
                    className="flex w-full flex-col gap-1.5"
                >
                    <FieldLabel>{locale.name}</FieldLabel>
                    <Input className="w-full" />
                    <FieldError>
                        {form.errors[`translations.${locale.code}`]}
                    </FieldError>
                </TextField>
            ))}
        </ResourceEditContent>
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
