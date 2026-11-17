import { Head } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
                    <CardTitle>Appearance settings</CardTitle>
                    <CardDescription>
                        Update your account&apos;s appearance settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 pb-5">
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
