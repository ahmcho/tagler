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

type DatePickerFieldProps = {
    label: string;
    value: CalendarDate | null;
    onChange: (next: CalendarDate | null) => void;
    minValue?: CalendarDate;
    /** Validation message. Shows under the field and marks it invalid. */
    error?: string;
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
            <FieldError>{error}</FieldError>
        </DatePicker>
    );
}
