/** Largest value the server accepts. It is the storage limit of the column. */
export const MAX_LINK_LIFETIME_MINUTES = 4294967295;

export type LinkLifetimeResult =
    | { ok: true; value: number | null }
    | { ok: false; error: string };

/**
 * Empty input means "use the global setting", which is stored as null. Anything else must be a
 * whole number of minutes, at least 1.
 */
export function parseLinkLifetime(input: string): LinkLifetimeResult {
    const trimmed = input.trim();

    if (trimmed === '') {
        return { ok: true, value: null };
    }

    if (!/^\d+$/.test(trimmed)) {
        return { ok: false, error: 'Enter a whole number of minutes.' };
    }

    const value = Number(trimmed);

    if (value < 1) {
        return { ok: false, error: 'The lifetime must be at least 1 minute.' };
    }

    if (value > MAX_LINK_LIFETIME_MINUTES) {
        return { ok: false, error: 'The lifetime is too long.' };
    }

    return { ok: true, value };
}
