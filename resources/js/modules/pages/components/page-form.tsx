import type { InertiaFormProps } from '@inertiajs/react';
import type { CalendarDateTime } from '@internationalized/date';
import { parseDateTime } from '@internationalized/date';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import {
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeader,
    CalendarHeading,
    NavButton,
} from '@/components/tailgrids/core/calendar';
import { DateInput, DateSegment } from '@/components/tailgrids/core/date-field';
import {
    DatePicker,
    DatePickerGroup,
    DatePickerPopover,
    DatePickerTrigger,
} from '@/components/tailgrids/core/date-picker';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import {
    NativeSelect,
    NativeSelectOption,
} from '@/components/tailgrids/core/native-select';
import {
    Select,
    SelectContent,
    SelectIndicator,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/tailgrids/core/select';
import { TextField } from '@/components/tailgrids/core/text-field';
import type {
    ContentDocument,
    ContentEditorConfig,
} from '@/modules/pages/components/content-document';
import { ContentEditor } from '@/modules/pages/components/content-editor';
import { LocaleFlag } from '@/modules/pages/components/locale-flag';
import { cn } from '@/utils/cn';

export type PageParentOption = {
    id: number;
    title: string;
    path: string;
};

export type PageLocaleOption = {
    code: string;
    name: string;
    country: string | null;
};

export type PageStatus = 'draft' | 'published' | 'scheduled';

const STATUS_LABELS: Record<PageStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    scheduled: 'Scheduled',
};

/** Converts the stored `YYYY-MM-DDTHH:mm` text into a calendar value, or null when empty or invalid. */
function toDateTime(value: string): CalendarDateTime | null {
    if (value === '') {
        return null;
    }

    try {
        return parseDateTime(value);
    } catch {
        return null;
    }
}

export type PageTranslationFormData = {
    title: string;
    subtitle: string;
    slug: string;
    seo_title: string;
    seo_description: string;
    /** The locale's content document: sections and elements. */
    content: ContentDocument;
};

export type PageFormData = {
    parent_id: number | null;
    status: PageStatus;
    published_at: string;
    layout: string;
    translations: Record<string, PageTranslationFormData>;
};

type Props = {
    form: InertiaFormProps<PageFormData>;
    parents: PageParentOption[];
    locales: PageLocaleOption[];
    defaultLocale: string;
    editor: ContentEditorConfig;
};

/**
 * Page fields. Page-wide fields come first. The locale tabs hold the fields
 * that differ per language. The shared `ResourceForm` provides the form and buttons.
 */
export function PageFields({
    form,
    parents,
    locales,
    defaultLocale,
    editor,
}: Props) {
    const [activeLocale, setActiveLocale] = useState(defaultLocale);

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <FieldLabel>Parent page</FieldLabel>
                    <NativeSelect
                        value={
                            form.data.parent_id === null
                                ? ''
                                : String(form.data.parent_id)
                        }
                        onChange={(event) =>
                            form.setData(
                                'parent_id',
                                event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            )
                        }
                    >
                        <NativeSelectOption value="">
                            No parent (top level)
                        </NativeSelectOption>
                        {parents.map((parent) => (
                            <NativeSelectOption
                                key={parent.id}
                                value={String(parent.id)}
                            >
                                {parent.title} ({parent.path})
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                    <ErrorMessage message={form.errors.parent_id} />
                </div>

                <Select
                    value={form.data.status}
                    onChange={(key) =>
                        form.setData('status', String(key) as PageStatus)
                    }
                    isInvalid={Boolean(form.errors.status)}
                >
                    <SelectLabel>Status</SelectLabel>
                    <SelectTrigger>
                        <SelectValue />
                        <SelectIndicator />
                    </SelectTrigger>
                    <SelectContent>
                        {(Object.keys(STATUS_LABELS) as PageStatus[]).map(
                            (status) => (
                                <SelectItem key={status} id={status}>
                                    {STATUS_LABELS[status]}
                                </SelectItem>
                            ),
                        )}
                    </SelectContent>
                </Select>
                <ErrorMessage message={form.errors.status} />

                <DatePicker
                    value={toDateTime(form.data.published_at)}
                    onChange={(next) =>
                        form.setData(
                            'published_at',
                            next ? next.toString().slice(0, 16) : '',
                        )
                    }
                    granularity="minute"
                    hourCycle={24}
                    invalid={Boolean(form.errors.published_at)}
                    className="flex w-full flex-col gap-1.5"
                >
                    <FieldLabel>Publish date and time</FieldLabel>
                    <DatePickerGroup>
                        <DateInput>
                            {(segment) => <DateSegment segment={segment} />}
                        </DateInput>
                        <DatePickerTrigger aria-label="Open calendar">
                            <CalendarIcon className="size-5" />
                        </DatePickerTrigger>
                    </DatePickerGroup>
                    <DatePickerPopover>
                        <Calendar>
                            <CalendarHeader>
                                <NavButton slot="previous">
                                    <ChevronLeft />
                                </NavButton>
                                <CalendarHeading />
                                <NavButton slot="next">
                                    <ChevronRight />
                                </NavButton>
                            </CalendarHeader>
                            <CalendarGrid>
                                <CalendarGridHeader />
                                <CalendarGridBody>
                                    {(date) => <CalendarCell date={date} />}
                                </CalendarGridBody>
                            </CalendarGrid>
                        </Calendar>
                    </DatePickerPopover>
                    <FieldError>{form.errors.published_at}</FieldError>
                </DatePicker>

                <TextField
                    value={form.data.layout}
                    onChange={(value) => form.setData('layout', value)}
                    invalid={Boolean(form.errors.layout)}
                    className="flex w-full flex-col gap-1.5"
                >
                    <FieldLabel>Layout key</FieldLabel>
                    <Input className="w-full" />
                    <FieldError>{form.errors.layout}</FieldError>
                </TextField>
            </div>

            <div className="flex flex-col gap-4">
                <div
                    role="tablist"
                    aria-label="Languages"
                    className="flex flex-wrap justify-center gap-2"
                >
                    {locales.map((locale) => {
                        const hasErrors = Object.keys(form.errors).some((key) =>
                            key.startsWith(`translations.${locale.code}.`),
                        );

                        return (
                            <button
                                key={locale.code}
                                type="button"
                                role="tab"
                                aria-selected={activeLocale === locale.code}
                                aria-label={locale.name}
                                title={locale.name}
                                onClick={() => setActiveLocale(locale.code)}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2',
                                    activeLocale === locale.code
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : 'border-base-300 text-title-50',
                                    hasErrors &&
                                        'border-input-error-focus-border',
                                )}
                            >
                                <LocaleFlag
                                    country={locale.country}
                                    label={locale.name}
                                />
                                <span className="text-sm font-medium">
                                    {locale.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {locales
                    .filter((locale) => locale.code === activeLocale)
                    .map((locale) => (
                        <div
                            key={locale.code}
                            role="tabpanel"
                            className="flex flex-col gap-6"
                        >
                            <LocaleFields
                                form={form}
                                code={locale.code}
                                isDefault={locale.code === defaultLocale}
                                editor={editor}
                            />
                        </div>
                    ))}
            </div>
        </>
    );
}

/** Error text for fields that are not inside a react-aria text field, where FieldError renders nothing. */
function ErrorMessage({ message }: { message?: string }) {
    return message ? (
        <p className="text-sm text-input-error">{message}</p>
    ) : null;
}

/**
 * Joins every content error for one locale. The server reports each bad
 * element or field under its own path, for example `translations.en.content.sections.0.layout`.
 */
function contentErrorFor(
    form: InertiaFormProps<PageFormData>,
    code: string,
): string | undefined {
    const prefix = `translations.${code}.content`;
    const topLevel = [prefix, `${prefix}.version`];
    const messages = Object.entries(
        form.errors as Record<string, string | undefined>,
    )
        .filter(([key]) => topLevel.includes(key))
        .map(([, message]) => message)
        .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(' ') : undefined;
}

/** Reads a nested error key such as `translations.en.slug`, which the typed form errors do not list. */
function errorFor(
    form: InertiaFormProps<PageFormData>,
    key: string,
): string | undefined {
    return (form.errors as Record<string, string | undefined>)[key];
}

function LocaleFields({
    form,
    code,
    isDefault,
    editor,
}: {
    form: InertiaFormProps<PageFormData>;
    code: string;
    isDefault: boolean;
    editor: ContentEditorConfig;
}) {
    const translation = form.data.translations[code];
    const field = (name: keyof PageTranslationFormData) =>
        `translations.${code}.${name}`;

    if (!translation) {
        return null;
    }

    const setField = (name: keyof PageTranslationFormData, value: unknown) =>
        form.setData('translations', {
            ...form.data.translations,
            [code]: { ...translation, [name]: value },
        });

    return (
        <>
            <p className="text-sm text-title-50">
                {isDefault
                    ? 'The default language. Title and slug are required.'
                    : 'Leave title and slug empty to skip this language.'}
            </p>

            <TextField
                value={translation.title}
                onChange={(value) => setField('title', value)}
                invalid={Boolean(errorFor(form, field('title')))}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>Title</FieldLabel>
                <Input className="w-full" />
                <FieldError>{errorFor(form, field('title'))}</FieldError>
            </TextField>

            <TextField
                value={translation.subtitle}
                onChange={(value) => setField('subtitle', value)}
                invalid={Boolean(errorFor(form, field('subtitle')))}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>Subtitle</FieldLabel>
                <Input className="w-full" />
                <FieldError>{errorFor(form, field('subtitle'))}</FieldError>
            </TextField>

            <TextField
                value={translation.slug}
                onChange={(value) => setField('slug', value)}
                invalid={Boolean(errorFor(form, field('slug')))}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>URL slug</FieldLabel>
                <Input className="w-full" />
                <FieldError>{errorFor(form, field('slug'))}</FieldError>
            </TextField>

            <TextField
                value={translation.seo_title}
                onChange={(value) => setField('seo_title', value)}
                invalid={Boolean(errorFor(form, field('seo_title')))}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>SEO title</FieldLabel>
                <Input className="w-full" />
                <FieldError>{errorFor(form, field('seo_title'))}</FieldError>
            </TextField>

            <TextField
                value={translation.seo_description}
                onChange={(value) => setField('seo_description', value)}
                invalid={Boolean(errorFor(form, field('seo_description')))}
                className="flex w-full flex-col gap-1.5"
            >
                <FieldLabel>SEO description</FieldLabel>
                <Input className="w-full" />
                <FieldError>
                    {errorFor(form, field('seo_description'))}
                </FieldError>
            </TextField>

            <div className="flex flex-col gap-3">
                <FieldLabel>Sections</FieldLabel>
                <ContentEditor
                    value={translation.content}
                    onChange={(next) => setField('content', next)}
                    config={editor}
                    errorFor={(path) =>
                        errorFor(form, `translations.${code}.content.${path}`)
                    }
                />
                <ErrorMessage message={contentErrorFor(form, code)} />
            </div>
        </>
    );
}
