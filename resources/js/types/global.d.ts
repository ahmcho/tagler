import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            favicon: string;
            timeHourCycle: 12 | 24;
            dateFormat: string;
            dateTimeFormat: string;
            timezone: string;
            auth: Auth;
            can: Record<string, boolean>;
            [key: string]: unknown;
        };
    }
}
