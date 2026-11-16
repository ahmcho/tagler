import { usePage } from '@inertiajs/react';

export type CanFn = (permission: string) => boolean;

export function useCan(): CanFn {
    const { permissions } = usePage().props.auth;

    return (permission) => permissions.includes(permission);
}
