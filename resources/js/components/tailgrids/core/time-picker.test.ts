import { describe, expect, it } from 'vitest';

import { formatTime, toColumns, toValue } from './time-picker';

describe('toColumns', () => {
    it('splits a 24-hour value into 12-hour columns with AM/PM', () => {
        expect(toColumns('00:05', 12)).toEqual({
            hour: '12',
            minute: '05',
            period: 'AM',
        });
        expect(toColumns('09:30', 12)).toEqual({
            hour: '09',
            minute: '30',
            period: 'AM',
        });
        expect(toColumns('13:45', 12)).toEqual({
            hour: '01',
            minute: '45',
            period: 'PM',
        });
    });

    it('keeps the 24-hour hour and drops the period for the 24-hour cycle', () => {
        expect(toColumns('13:45', 24)).toEqual({ hour: '13', minute: '45' });
        expect(toColumns('00:00', 24)).toEqual({ hour: '00', minute: '00' });
    });

    it('returns null for an empty or malformed value', () => {
        expect(toColumns('', 12)).toBeNull();
        expect(toColumns('9:30', 24)).toBeNull();
    });
});

describe('toValue', () => {
    it('joins 12-hour columns into a 24-hour value', () => {
        expect(toValue({ hour: '12', minute: '05', period: 'AM' }, 12)).toBe(
            '00:05',
        );
        expect(toValue({ hour: '12', minute: '00', period: 'PM' }, 12)).toBe(
            '12:00',
        );
        expect(toValue({ hour: '01', minute: '45', period: 'PM' }, 12)).toBe(
            '13:45',
        );
    });

    it('uses the hour as given for the 24-hour cycle', () => {
        expect(toValue({ hour: '00', minute: '30' }, 24)).toBe('00:30');
        expect(toValue({ hour: '23', minute: '59' }, 24)).toBe('23:59');
    });

    it('round-trips a value through both cycles', () => {
        for (const value of ['00:00', '07:15', '12:00', '18:40', '23:59']) {
            expect(toValue(toColumns(value, 12)!, 12)).toBe(value);
            expect(toValue(toColumns(value, 24)!, 24)).toBe(value);
        }
    });
});

describe('formatTime', () => {
    it('shows the 12-hour text with AM/PM', () => {
        expect(formatTime('13:45', 12)).toBe('01:45 PM');
        expect(formatTime('00:05', 12)).toBe('12:05 AM');
    });

    it('shows the 24-hour text without AM/PM', () => {
        expect(formatTime('13:45', 24)).toBe('13:45');
    });

    it('returns an empty string when no time is set', () => {
        expect(formatTime('', 12)).toBe('');
        expect(formatTime('', 24)).toBe('');
    });
});
