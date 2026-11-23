'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Dialog, DialogTrigger, Popover } from 'react-aria-components';
import { Button } from '@/components/tailgrids/core/button';
import { cn } from '@/utils/cn';

const HOURS = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
];
const MINUTES = Array.from({ length: 60 }, (_, index) =>
    String(index).padStart(2, '0'),
);
const PERIODS = ['AM', 'PM'] as const;

type Period = (typeof PERIODS)[number];

type Columns = { hour: string; minute: string; period: Period };

/** Splits `HH:mm` (24-hour) into the 12-hour parts the columns show. */
function toColumns(value: string): Columns | null {
    const match = /^(\d{2}):(\d{2})$/.exec(value);

    if (match === null) {
        return null;
    }

    const hour24 = Number(match[1]);

    return {
        hour: String(hour24 % 12 || 12).padStart(2, '0'),
        minute: match[2],
        period: hour24 >= 12 ? 'PM' : 'AM',
    };
}

/** Joins the 12-hour column values into `HH:mm` (24-hour). */
function toValue({ hour, minute, period }: Columns): string {
    const hour24 = (Number(hour) % 12) + (period === 'PM' ? 12 : 0);

    return `${String(hour24).padStart(2, '0')}:${minute}`;
}

export interface TimePickerProps {
    children: ReactNode;
    /** Selected time as `HH:mm` (24-hour). An empty string means none is selected. */
    value?: string;
    onChange?: (value: string) => void;
}

/**
 * Popover with hour, minute and AM/PM columns. Controlled through `value` and
 * `onChange`, which use `HH:mm` text. The popover stays open while the user
 * picks values. It closes on an outside press or Escape, as in the docs.
 */
export function TimePicker({
    children,
    value = '',
    onChange,
}: TimePickerProps) {
    const selected = toColumns(value);

    const pick = (next: Partial<Columns>) => {
        onChange?.(
            toValue({
                hour: selected?.hour ?? '12',
                minute: selected?.minute ?? '00',
                period: selected?.period ?? 'AM',
                ...next,
            }),
        );
    };

    return (
        <DialogTrigger>
            {children}
            <Popover className="rounded-xl border border-base-100 bg-background-50 p-2 shadow-lg outline-none">
                <Dialog aria-label="Time options" className="outline-none">
                    <div className="grid max-w-fit min-w-40 grid-cols-3 gap-1.5 divide-x divide-base-100">
                        <TimeColumn
                            values={HOURS}
                            selected={selected?.hour}
                            onSelect={(hour) => pick({ hour })}
                        />
                        <TimeColumn
                            values={MINUTES}
                            selected={selected?.minute}
                            onSelect={(minute) => pick({ minute })}
                        />
                        <TimeColumn
                            values={[...PERIODS]}
                            selected={selected?.period}
                            onSelect={(period) =>
                                pick({ period: period as Period })
                            }
                        />
                    </div>
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
}

/** Trigger button. Uses the Tailgrids outline button, as on the docs page. */
export function TimePickerTrigger({
    className,
    ...props
}: ComponentProps<typeof Button>) {
    return (
        <Button
            appearance="outline"
            size="md"
            className={cn('outline-none', className)}
            {...props}
        />
    );
}

function TimeColumn({
    values,
    selected,
    onSelect,
}: {
    values: string[];
    selected?: string;
    onSelect: (value: string) => void;
}) {
    return (
        <div className="flex max-h-73 flex-col gap-1 overflow-y-auto pr-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {values.map((value) => (
                <button
                    key={value}
                    type="button"
                    aria-pressed={value === selected}
                    onClick={() => onSelect(value)}
                    className={cn(
                        'grid size-11.5 shrink-0 place-items-center rounded-lg text-sm transition',
                        value === selected
                            ? 'bg-datepicker-selected-background text-white-100'
                            : 'text-title-50 hover:bg-datepicker-selected-hover-background',
                    )}
                >
                    {value}
                </button>
            ))}
        </div>
    );
}
