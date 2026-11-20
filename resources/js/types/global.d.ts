import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            favicon: string;
            auth: Auth;
            can: Record<string, boolean>;
            [key: string]: unknown;
        };
    }
}
