import { usePage } from '@inertiajs/react';
import { formatDateInZone } from '@/utils/date-format';

/**
 * Formats ISO dates with the date and datetime formats and the timezone chosen in the settings.
 * Pass null or an empty value to get an empty string.
 */
export function useDateFormat() {
    const { dateFormat, dateTimeFormat, timezone } = usePage().props;

    return {
        formatDate: (iso: string | null): string =>
            iso ? formatDateInZone(iso, dateFormat, timezone) : '',
        formatDateTime: (iso: string | null): string =>
            iso ? formatDateInZone(iso, dateTimeFormat, timezone) : '',
    };
}
