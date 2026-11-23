import type { FlagComponent } from 'country-flag-icons/react/3x2';
import { AZ, GB, RU } from 'country-flag-icons/react/3x2';

/** Flag components by ISO country code. The server sends the code for each locale. */
const flags: Record<string, FlagComponent> = { AZ, GB, RU };

/**
 * A flag for a locale. The label is the language name, so screen readers
 * still announce it. Renders nothing for a country without a flag.
 */
export function LocaleFlag({
    country,
    label,
    className = 'h-4 w-6 rounded-sm',
}: {
    country: string | null;
    label: string;
    className?: string;
}) {
    const Flag = country ? flags[country] : undefined;

    if (!Flag) {
        return null;
    }

    return (
        <Flag
            role="img"
            aria-label={label}
            title={label}
            className={className}
        />
    );
}
