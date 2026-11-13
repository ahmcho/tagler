import { Head } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardHeader,
} from '@/components/tailgrids/core/card';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';
import { edit as editAppearance } from '@/routes/appearance';

const appearanceOptions: {
    value: Appearance;
    label: string;
    icon: typeof Sun;
}[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

export default function Appearance() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <Head title="Appearance settings" />

            <Card>
                <CardHeader>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Appearance settings
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Update your account&apos;s appearance settings
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {appearanceOptions.map(({ value, label, icon: Icon }) => (
                        <Button
                            key={value}
                            appearance={
                                appearance === value ? 'fill' : 'outline'
                            }
                            onPress={() => updateAppearance(value)}
                        >
                            <Icon size={18} />
                            {label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance().url,
        },
    ],
};
