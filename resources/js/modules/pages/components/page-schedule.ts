import type { PageStatus } from '@/modules/pages/components/page-form';

/** The backend compares publish dates and times in UTC, so the form uses UTC too. */
export const SERVER_TIME_ZONE = 'UTC';

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
export function scheduleError(
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

type ScheduleIssue = NonNullable<ReturnType<typeof scheduleError>>;

/** The server error for a publish field. Without one, the early schedule message for that field. */
export function publishError(
    serverError: string | undefined,
    scheduleIssue: ScheduleIssue | null,
    field: ScheduleIssue['field'],
): string | undefined {
    return (
        serverError ??
        (scheduleIssue?.field === field ? scheduleIssue.message : undefined)
    );
}
