import type { AlertStatus } from '@/components/tailgrids/core/alert';

export type FlashMessage = {
    status: AlertStatus;
    message: string;
};

/**
 * Fortify flashes these keys as the session `status`. They are not text, so
 * the toast shows the sentence for each one.
 */
const FORTIFY_STATUS_MESSAGES: Record<string, string> = {
    'password-updated': 'Password updated.',
    'profile-information-updated': 'Profile updated.',
    'recovery-codes-generated': 'Recovery codes generated.',
    'two-factor-authentication-confirmed':
        'Two-factor authentication confirmed.',
    'two-factor-authentication-disabled': 'Two-factor authentication disabled.',
    'two-factor-authentication-enabled': 'Two-factor authentication enabled.',
    'verification-link-sent':
        'A new verification link has been sent to your email address.',
};

const ALERT_STATUSES: readonly AlertStatus[] = [
    'default',
    'success',
    'warning',
    'error',
    'info',
];

function isAlertStatus(value: unknown): value is AlertStatus {
    return ALERT_STATUSES.some((status) => status === value);
}

/**
 * Picks the one message to toast for a response. The `toast` flash wins over
 * the session `status`. Returns null when the response carries no message.
 */
export function getFlashMessage(
    flash: Record<string, unknown> | undefined,
    status: unknown,
): FlashMessage | null {
    const toast = flash?.toast as
        | { type?: unknown; message?: unknown }
        | undefined;

    if (toast && typeof toast.message === 'string' && toast.message !== '') {
        return {
            status: isAlertStatus(toast.type) ? toast.type : 'default',
            message: toast.message,
        };
    }

    if (typeof status !== 'string' || status === '') {
        return null;
    }

    return {
        status: 'success',
        message: Object.hasOwn(FORTIFY_STATUS_MESSAGES, status)
            ? FORTIFY_STATUS_MESSAGES[status]
            : status,
    };
}
