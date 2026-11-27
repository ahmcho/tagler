const PART_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
};

/**
 * Formats an ISO date in a timezone with a PHP `date()` pattern such as `d.m.Y H:i`.
 * Only the tokens the date settings use are replaced (`d m Y H i s`). Other characters are copied as they are.
 */
export function formatDateInZone(
    iso: string,
    pattern: string,
    timeZone: string,
): string {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const values: Record<string, string> = {};

    for (const part of new Intl.DateTimeFormat('en-US', {
        ...PART_OPTIONS,
        timeZone,
    }).formatToParts(date)) {
        values[part.type] = part.value;
    }

    return applyDatePattern(pattern, {
        day: values.day,
        month: values.month,
        year: values.year,
        hour: values.hour,
        minute: values.minute,
        second: values.second,
    });
}

/**
 * Formats a calendar date (no time, no timezone) with a PHP `date()` pattern such as `d.m.Y`.
 */
export function formatCalendarDate(
    date: { year: number; month: number; day: number },
    pattern: string,
): string {
    return applyDatePattern(pattern, {
        day: String(date.day).padStart(2, '0'),
        month: String(date.month).padStart(2, '0'),
        year: String(date.year),
    });
}

function applyDatePattern(
    pattern: string,
    values: Partial<
        Record<'day' | 'month' | 'year' | 'hour' | 'minute' | 'second', string>
    >,
): string {
    const tokens: Record<string, string | undefined> = {
        d: values.day,
        m: values.month,
        Y: values.year,
        H: values.hour,
        i: values.minute,
        s: values.second,
    };

    return pattern.replace(/[dmYHis]/g, (token) => tokens[token] ?? '');
}
