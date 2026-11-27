import { describe, expect, it } from 'vitest';
import { formatCalendarDate, formatDateInZone } from './date-format';

describe('formatCalendarDate', () => {
    it('pads day and month and keeps the chosen separators', () => {
        const date = { year: 2026, month: 3, day: 5 };

        expect(formatCalendarDate(date, 'd.m.Y')).toBe('05.03.2026');
        expect(formatCalendarDate(date, 'Y-m-d')).toBe('2026-03-05');
        expect(formatCalendarDate(date, 'm/d/Y')).toBe('03/05/2026');
    });
});

describe('formatDateInZone', () => {
    it('shows the date and time in the chosen timezone', () => {
        expect(
            formatDateInZone(
                '2026-11-20T13:45:30Z',
                'd.m.Y H:i:s',
                'Asia/Baku',
            ),
        ).toBe('20.11.2026 17:45:30');
    });

    it('replaces only the date tokens and keeps the separators', () => {
        expect(formatDateInZone('2026-11-20T13:45:30Z', 'Y-m-d', 'UTC')).toBe(
            '2026-11-20',
        );
        expect(formatDateInZone('2026-11-20T13:45:30Z', 'm/d/Y', 'UTC')).toBe(
            '11/20/2026',
        );
    });

    it('uses the day of the chosen timezone when the UTC day differs', () => {
        expect(
            formatDateInZone('2026-11-20T23:30:00Z', 'd/m/Y H:i', 'Asia/Baku'),
        ).toBe('21/11/2026 03:30');
    });

    it('returns an empty string for an invalid date', () => {
        expect(formatDateInZone('not a date', 'd.m.Y', 'UTC')).toBe('');
    });
});
