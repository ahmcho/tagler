import type { InertiaFormProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { today } from '@internationalized/date';
import { Info } from 'lucide-react';
import { useState } from 'react';
import {
    ButtonContext,
    Dialog,
    DialogTrigger,
    Popover,
} from 'react-aria-components';
import {
    DatePickerField,
    toCalendarDate,
} from '@/components/date-picker-field';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
} from '@/components/tailgrids/core/input-group';
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
import {
    formatTime,
    TimePicker,
    TimePickerTrigger,
} from '@/components/tailgrids/core/time-picker';
import { Toggle } from '@/components/tailgrids/core/toggle';
import type {
    ContentDocument,
    ContentEditorConfig,
} from '@/modules/pages/components/content-document';
import { ContentEditor } from '@/modules/pages/components/content-editor';
import { LocaleFlag } from '@/modules/pages/components/locale-flag';
import {
    publishError,
    scheduleError,
    SERVER_TIME_ZONE,
} from '@/modules/pages/components/page-schedule';
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

/** Select key for "No parent". React Aria keys cannot be null. */
const NO_PARENT_KEY = '__none__';

const STATUS_LABELS: Record<PageStatus, string> = {
    draft: 'Draft',
    published: 'Published',
    scheduled: 'Scheduled',
};

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
    /** Publish date as `YYYY-MM-DD`, or empty. */
    publish_date: string;
    /** Publish time as `HH:mm` (24-hour), or empty. */
    publish_time: string;
    layout: string;
    /** Whether the active theme's template shows this page. Off means the plain view. */
    theme_layout: boolean;
    translations: Record<string, PageTranslationFormData>;
};

type Props = {
    form: InertiaFormProps<PageFormData>;
    parents: PageParentOption[];
    locales: PageLocaleOption[];
    defaultLocale: string;
    editor: ContentEditorConfig;
};

function parentKey(parentId: number | null): string {
    return parentId === null ? NO_PARENT_KEY : String(parentId);
}

function parentIdFromKey(key: unknown): number | null {
    return String(key) === NO_PARENT_KEY ? null : Number(key);
}

function localeHasErrors(
    errors: InertiaFormProps<PageFormData>['errors'],
    localeCode: string,
): boolean {
    return Object.keys(errors).some((key) =>
        key.startsWith(`translations.${localeCode}.`),
    );
}

type PageFormProps = { form: InertiaFormProps<PageFormData> };

function ParentSelect({
    form,
    parents,
}: PageFormProps & { parents: PageParentOption[] }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Select
                value={parentKey(form.data.parent_id)}
                onChange={(key) =>
                    form.setData('parent_id', parentIdFromKey(key))
                }
                isInvalid={Boolean(form.errors.parent_id)}
            >
                <SelectLabel>Parent page</SelectLabel>
                <SelectTrigger>
                    <SelectValue />
                    <SelectIndicator />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem id={NO_PARENT_KEY}>
                        No parent (top level)
                    </SelectItem>
                    {parents.map((parent) => (
                        <SelectItem key={parent.id} id={String(parent.id)}>
                            {parent.title} ({parent.path})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <ErrorMessage message={form.errors.parent_id} />
        </div>
    );
}

function StatusSelect({ form }: PageFormProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Select
                value={form.data.status}
                onChange={(key) => {
                    form.setData('status', String(key) as PageStatus);
                    form.clearErrors('publish_date', 'publish_time');
                }}
                isInvalid={Boolean(form.errors.status)}
            >
                <SelectLabel>Status</SelectLabel>
                <InputGroup
                    className={cn(
                        form.errors.status && 'border-input-error-focus-border',
                    )}
                >
                    <SelectTrigger className="flex-1 rounded-none border-none bg-transparent shadow-none focus:border-none focus:ring-0">
                        <SelectValue />
                        <SelectIndicator />
                    </SelectTrigger>
                    <InputGroupAddon align="inline-end">
                        <StatusHelp />
                    </InputGroupAddon>
                </InputGroup>
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
        </div>
    );
}

function PublishTimeField({
    form,
    hourCycle,
    error,
}: PageFormProps & { hourCycle: 12 | 24; error: string | undefined }) {
    return (
        <div className="flex w-full flex-col gap-1.5">
            <FieldLabel>Publish time</FieldLabel>
            <TimePicker
                hourCycle={hourCycle}
                value={form.data.publish_time}
                onChange={(next) => {
                    form.setData('publish_time', next);
                    form.clearErrors('publish_time');
                }}
            >
                <TimePickerTrigger
                    className={cn(
                        'min-w-37.5 justify-start',
                        error && 'border-input-error-focus-border',
                    )}
                >
                    {formatTime(form.data.publish_time, hourCycle) ||
                        'Select time'}
                </TimePickerTrigger>
            </TimePicker>
            <ErrorMessage message={error} />
        </div>
    );
}

/** The language tabs. A tab turns red when its locale has any error. */
function LocaleTabs({
    locales,
    activeLocale,
    errors,
    onSelect,
}: {
    locales: PageLocaleOption[];
    activeLocale: string;
    errors: InertiaFormProps<PageFormData>['errors'];
    onSelect: (code: string) => void;
}) {
    return (
        <div
            role="tablist"
            aria-label="Languages"
            className="flex flex-wrap justify-center gap-2"
        >
            {locales.map((locale) => {
                const isActive = activeLocale === locale.code;

                return (
                    <button
                        key={locale.code}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={locale.name}
                        title={locale.name}
                        onClick={() => onSelect(locale.code)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-3 py-2',
                            isActive
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-base-300 text-title-50',
                            localeHasErrors(errors, locale.code) &&
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
    );
}

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
    const { timeHourCycle } = usePage().props;

    const scheduleIssue = scheduleError(
        form.data.status,
        form.data.publish_date,
        form.data.publish_time,
    );
    const isScheduled = form.data.status === 'scheduled';

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2">
                <ParentSelect form={form} parents={parents} />
                <StatusSelect form={form} />

                <DatePickerField
                    label="Publish date"
                    value={toCalendarDate(form.data.publish_date)}
                    onChange={(next) => {
                        form.setData(
                            'publish_date',
                            next ? next.toString() : '',
                        );
                        form.clearErrors('publish_date');
                    }}
                    minValue={isScheduled ? today(SERVER_TIME_ZONE) : undefined}
                    error={publishError(
                        form.errors.publish_date,
                        scheduleIssue,
                        'publish_date',
                    )}
                />

                <PublishTimeField
                    form={form}
                    hourCycle={timeHourCycle}
                    error={publishError(
                        form.errors.publish_time,
                        scheduleIssue,
                        'publish_time',
                    )}
                />

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

                <Toggle
                    label="Use the theme layout"
                    checked={form.data.theme_layout}
                    onChange={(event) =>
                        form.setData('theme_layout', event.target.checked)
                    }
                />
            </div>

            <div className="flex flex-col gap-4">
                <LocaleTabs
                    locales={locales}
                    activeLocale={activeLocale}
                    errors={form.errors}
                    onSelect={setActiveLocale}
                />

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

/** Small info button by the status field. Its popover explains scheduling. */
function StatusHelp() {
    return (
        <ButtonContext.Provider value={null}>
            <DialogTrigger>
                <InputGroupButton aria-label="About scheduling">
                    <Info aria-hidden="true" />
                </InputGroupButton>
                <Popover
                    placement="bottom end"
                    className="max-w-72 rounded-xl bg-dropdown-background p-3 text-sm text-title-50 shadow-md outline-hidden"
                >
                    <Dialog
                        aria-label="About scheduling"
                        className="outline-none"
                    >
                        <p>
                            A scheduled page goes live on its publish date and
                            time. Both must be later than now. Times use UTC.
                        </p>
                    </Dialog>
                </Popover>
            </DialogTrigger>
        </ButtonContext.Provider>
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
