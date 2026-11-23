import type { InertiaFormProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import type { CalendarDate } from '@internationalized/date';
import { parseDate, today } from '@internationalized/date';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Info,
} from 'lucide-react';
import { useState } from 'react';
import {
    Button as AriaButton,
    Dialog,
    DialogTrigger,
    Popover,
} from 'react-aria-components';
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

/** Converts the stored `YYYY-MM-DD` text into a calendar value, or null when empty or invalid. */
function toCalendarDate(value: string): CalendarDate | null {
    if (value === '') {
        return null;
    }

    try {
        return parseDate(value);
    } catch {
        return null;
    }
}

/** The backend compares publish dates and times in UTC, so the form uses UTC too. */
const SERVER_TIME_ZONE = 'UTC';

const PAST_DATE_MESSAGE = 'Choose a date that is not in the past.';
const PAST_TIME_MESSAGE = 'Choose a time later than the current time (UTC).';

/** The current date and time in UTC, as `YYYY-MM-DD` and `HH:mm`. */
function utcNow(): { date: string; time: string } {
    const iso = new Date().toISOString();

    return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/**
 * Early feedback for a scheduled page. The server repeats the check, so this
 * only shows the message sooner. Returns null when the values are fine.
 */
function scheduleError(
    status: PageStatus,
    publishDate: string,
    publishTime: string,
): { field: 'publish_date' | 'publish_time'; message: string } | null {
    if (status !== 'scheduled' || publishDate === '') {
        return null;
    }

    const now = utcNow();

    if (publishDate < now.date) {
        return { field: 'publish_date', message: PAST_DATE_MESSAGE };
    }

    if (
        publishDate === now.date &&
        publishTime !== '' &&
        publishTime <= now.time
    ) {
        return { field: 'publish_time', message: PAST_TIME_MESSAGE };
    }

    return null;
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
    const publishDateError =
        form.errors.publish_date ??
        (scheduleIssue?.field === 'publish_date'
            ? scheduleIssue.message
            : undefined);
    const publishTimeError =
        form.errors.publish_time ??
        (scheduleIssue?.field === 'publish_time'
            ? scheduleIssue.message
            : undefined);
    const isScheduled = form.data.status === 'scheduled';

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Select
                        value={
                            form.data.parent_id === null
                                ? NO_PARENT_KEY
                                : String(form.data.parent_id)
                        }
                        onChange={(key) =>
                            form.setData(
                                'parent_id',
                                String(key) === NO_PARENT_KEY
                                    ? null
                                    : Number(key),
                            )
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
                                <SelectItem
                                    key={parent.id}
                                    id={String(parent.id)}
                                >
                                    {parent.title} ({parent.path})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <ErrorMessage message={form.errors.parent_id} />
                </div>

                <div className="relative">
                    <Select
                        value={form.data.status}
                        onChange={(key) => {
                            form.setData('status', String(key) as PageStatus);
                            form.clearErrors('publish_date', 'publish_time');
                        }}
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
                    <StatusHelp />
                </div>
                <ErrorMessage message={form.errors.status} />

                <DatePicker
                    value={toCalendarDate(form.data.publish_date)}
                    onChange={(next: CalendarDate | null) => {
                        form.setData(
                            'publish_date',
                            next ? next.toString() : '',
                        );
                        form.clearErrors('publish_date');
                    }}
                    minValue={isScheduled ? today(SERVER_TIME_ZONE) : undefined}
                    granularity="day"
                    invalid={Boolean(publishDateError)}
                    className="flex w-full flex-col gap-1.5"
                >
                    <FieldLabel>Publish date</FieldLabel>
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
                    <FieldError>{publishDateError}</FieldError>
                </DatePicker>

                <div className="flex w-full flex-col gap-1.5">
                    <FieldLabel>Publish time</FieldLabel>
                    <TimePicker
                        hourCycle={timeHourCycle}
                        value={form.data.publish_time}
                        onChange={(next) => {
                            form.setData('publish_time', next);
                            form.clearErrors('publish_time');
                        }}
                    >
                        <TimePickerTrigger
                            className={cn(
                                'min-w-37.5 justify-start',
                                publishTimeError &&
                                    'border-input-error-focus-border',
                            )}
                        >
                            {formatTime(
                                form.data.publish_time,
                                timeHourCycle,
                            ) || 'Select time'}
                        </TimePickerTrigger>
                    </TimePicker>
                    <ErrorMessage message={publishTimeError} />
                </div>

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

/** Small info button by the status field. Its popover explains scheduling. */
function StatusHelp() {
    return (
        <DialogTrigger>
            <AriaButton
                aria-label="About scheduling"
                className="absolute top-0 right-0 inline-flex size-6 items-center justify-center rounded-full text-title-50 outline-none hover:bg-button-outline-hover-background data-focus-visible:ring-2 data-focus-visible:ring-button-primary-focus-ring"
            >
                <Info className="size-4" aria-hidden="true" />
            </AriaButton>
            <Popover
                placement="bottom end"
                className="max-w-72 rounded-xl border border-base-100 bg-background-50 p-3 text-sm text-title-50 shadow-lg outline-none"
            >
                <Dialog aria-label="About scheduling" className="outline-none">
                    <p>
                        A scheduled page goes live on its publish date and time.
                        Both must be later than now. Times use UTC.
                    </p>
                </Dialog>
            </Popover>
        </DialogTrigger>
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
