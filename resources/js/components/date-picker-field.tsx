import type { CalendarDate } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
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
import { cn } from '@/utils/cn';
import { formatCalendarDate } from '@/utils/date-format';

type DatePickerFieldProps = {
    label: string;
    value: CalendarDate | null;
    onChange: (next: CalendarDate | null) => void;
    minValue?: CalendarDate;
    /** Validation message. Shows under the field and marks it invalid. */
    error?: string;
    /**
     * PHP date pattern, such as `d.m.Y`. When set, the value is shown as text in this
     * format and the typed segments are replaced. The value itself is not changed.
     */
    displayFormat?: string;
    className?: string;
};

/** Converts the stored `YYYY-MM-DD` text into a calendar value, or null when empty or invalid. */
export function toCalendarDate(value: string): CalendarDate | null {
    if (value === '') {
        return null;
    }

    try {
        return parseDate(value);
    } catch {
        return null;
    }
}

/** A calendar date field with a popover calendar. Used by the page form and the list filters. */
export function DatePickerField({
    label,
    value,
    onChange,
    minValue,
    error,
    displayFormat,
    className = 'flex w-full flex-col gap-1.5',
}: DatePickerFieldProps) {
    return (
        <DatePicker
            value={value}
            onChange={onChange}
            minValue={minValue}
            granularity="day"
            invalid={Boolean(error)}
            className={className}
        >
            <FieldLabel>{label}</FieldLabel>
            {displayFormat ? (
                <DatePickerGroup>
                    <DatePickerTrigger
                        aria-label={label}
                        className={cn(
                            'static flex w-full translate-y-0 items-center justify-between gap-2 rounded-lg border bg-input-background px-4 py-2.5 text-left text-title-50 outline-none focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20',
                            error
                                ? 'border-input-error-focus-border'
                                : 'border-base-300 focus-visible:border-input-primary-focus-border',
                        )}
                    >
                        <span>
                            {value
                                ? formatCalendarDate(value, displayFormat)
                                : displayFormat
                                      .replace(/[dm]/g, '__')
                                      .replace(/Y/g, '____')}
                        </span>
                        <CalendarIcon className="size-5" />
                    </DatePickerTrigger>
                </DatePickerGroup>
            ) : (
                <DatePickerGroup>
                    <DateInput>
                        {(segment) => <DateSegment segment={segment} />}
                    </DateInput>
                    <DatePickerTrigger aria-label="Open calendar">
                        <CalendarIcon className="size-5" />
                    </DatePickerTrigger>
                </DatePickerGroup>
            )}
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
            <FieldError>{error}</FieldError>
        </DatePicker>
    );
}
