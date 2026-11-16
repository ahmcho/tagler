import { usePage } from '@inertiajs/react';

export type AbilityFn = (ability: string) => boolean;

/**
 * Reads the class-level abilities that the server shares as the `can` prop.
 * These come from the same policies the server checks.
 */
export function useAbility(): AbilityFn {
    const { can } = usePage().props;

    return (ability) => can[ability] === true;
}
