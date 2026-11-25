import { describe, expect, it } from 'vitest';
import { getFlashMessage } from './flash-message';

describe('getFlashMessage', () => {
    it('returns null when there is no message', () => {
        expect(getFlashMessage({}, undefined)).toBeNull();
        expect(getFlashMessage(undefined, '')).toBeNull();
    });

    it('uses the toast flash with its type', () => {
        expect(
            getFlashMessage(
                { toast: { type: 'error', message: 'Could not save.' } },
                undefined,
            ),
        ).toEqual({ status: 'error', message: 'Could not save.' });
    });

    it('falls back to default status for an unknown toast type', () => {
        expect(
            getFlashMessage(
                { toast: { type: 'loud', message: 'Hi.' } },
                undefined,
            ),
        ).toEqual({ status: 'default', message: 'Hi.' });
    });

    it('prefers the toast flash over the session status', () => {
        expect(
            getFlashMessage(
                { toast: { type: 'success', message: 'Profile updated.' } },
                'Something else',
            ),
        ).toEqual({ status: 'success', message: 'Profile updated.' });
    });

    it('shows a session status as a success message', () => {
        expect(getFlashMessage({}, 'Role created.')).toEqual({
            status: 'success',
            message: 'Role created.',
        });
    });

    it('turns a Fortify status key into a sentence', () => {
        expect(getFlashMessage({}, 'verification-link-sent')).toEqual({
            status: 'success',
            message:
                'A new verification link has been sent to your email address.',
        });
    });
});
