import type { CalendarDate } from '@internationalized/date';
import { parseDate } from '@internationalized/date';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { DateRangePicker } from 'react-aria-components';
import type { RangeValue } from 'react-aria-components';
import { DateInput, DateSegment } from '@/components/tailgrids/core/date-field';
import {
    DatePickerGroup,
    DatePickerPopover,
    DatePickerTrigger,
} from '@/components/tailgrids/core/date-picker';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import {
    RangeCalendar,
    RangeCalendarCell,
    RangeCalendarGrid,
    RangeCalendarGridBody,
    RangeCalendarGridHeader,
    RangeCalendarHeader,
    RangeCalendarHeading,
    RangeNavButton,
} from '@/components/tailgrids/core/range-calendar';

type DateRangePickerFieldProps = {
    label: string;
    value: RangeValue<CalendarDate> | null;
    onChange: (next: RangeValue<CalendarDate> | null) => void;
    /** Validation message. Shows under the field and marks it invalid. */
    error?: string;
    className?: string;
};

/** Reads the stored `YYYY-MM-DD,YYYY-MM-DD` text into a range, or null when empty or invalid. */
export function toCalendarRange(
    value: string,
): RangeValue<CalendarDate> | null {
    const [start, end, ...rest] = value.split(',');

    if (start === undefined || end === undefined || rest.length > 0) {
        return null;
    }

    try {
        return { start: parseDate(start), end: parseDate(end) };
    } catch {
        return null;
    }
}

/** Stores a range as the `YYYY-MM-DD,YYYY-MM-DD` text the server filter reads. */
export function formatCalendarRange(range: RangeValue<CalendarDate>): string {
    return `${range.start.toString()},${range.end.toString()}`;
}

/** A date range field with a popover range calendar. Used by the list filters. */
export function DateRangePickerField({
    label,
    value,
    onChange,
    error,
    className = 'flex w-full flex-col gap-1.5',
}: DateRangePickerFieldProps) {
    return (
        <DateRangePicker
            value={value}
            onChange={onChange}
            granularity="day"
            isInvalid={Boolean(error)}
            className={className}
        >
            <FieldLabel>{label}</FieldLabel>
            <DatePickerGroup className="flex items-center gap-2">
                <DateInput slot="start" className="min-w-0 flex-1">
                    {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <span aria-hidden="true" className="text-title-50">
                    –
                </span>
                <DateInput slot="end" className="min-w-0 flex-1 pr-12">
                    {(segment) => <DateSegment segment={segment} />}
                </DateInput>
                <DatePickerTrigger aria-label="Open calendar">
                    <CalendarIcon className="size-5" />
                </DatePickerTrigger>
            </DatePickerGroup>
            <DatePickerPopover>
                <RangeCalendar>
                    <RangeCalendarHeader>
                        <RangeNavButton slot="previous">
                            <ChevronLeft />
                        </RangeNavButton>
                        <RangeCalendarHeading />
                        <RangeNavButton slot="next">
                            <ChevronRight />
                        </RangeNavButton>
                    </RangeCalendarHeader>
                    <RangeCalendarGrid>
                        <RangeCalendarGridHeader />
                        <RangeCalendarGridBody>
                            {(date) => <RangeCalendarCell date={date} />}
                        </RangeCalendarGridBody>
                    </RangeCalendarGrid>
                </RangeCalendar>
            </DatePickerPopover>
            <FieldError>{error}</FieldError>
        </DateRangePicker>
    );
}
