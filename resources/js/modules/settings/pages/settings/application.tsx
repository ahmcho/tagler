import { Head, router, useForm } from '@inertiajs/react';
import { Settings, TriangleAlert } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import type { IconName } from 'lucide-react/dynamic';
import { useState } from 'react';
import type { FormEvent } from 'react';
import SettingController from '@/actions/App/Modules/Settings/Controllers/SettingController';
import { ResourceConfirmDialog } from '@/components/resource/resource-confirm-dialog';
import type { PendingConfirm } from '@/components/resource/resource-confirm-dialog';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/tailgrids/core/card';
import { FieldGroup } from '@/components/tailgrids/core/field';
import {
    TabContent,
    TabList,
    TabRoot,
    TabTrigger,
} from '@/components/tailgrids/core/tabs';
import { SettingFieldControl } from '@/modules/settings/components/setting-field';
import type {
    SettingField,
    SettingValue,
} from '@/modules/settings/components/setting-field';
import { SettingInputEnum } from '@/types/generated';

type SettingTab = {
    value: string;
    label: string;
    icon: string;
};

type SettingFormData = {
    settings: Record<string, SettingValue>;
};

type Props = {
    tabs: SettingTab[];
    fields: SettingField[];
};

export default function Application({ tabs, fields }: Props) {
    const form = useForm<SettingFormData>({
        settings: Object.fromEntries(
            fields.map((field) => [
                field.key,
                field.input === SettingInputEnum.File
                    ? null
                    : String(field.value ?? ''),
            ]),
        ),
    });

    const [activeTab, setActiveTab] = useState(tabs[0]?.value ?? '');
    const [pendingTab, setPendingTab] = useState<PendingConfirm | null>(null);

    const updateSetting = (key: string, value: SettingValue) => {
        form.setData('settings', { ...form.data.settings, [key]: value });
    };

    const requestTab = (nextTab: string) => {
        if (nextTab === activeTab) {
            return;
        }

        if (!form.isDirty) {
            setActiveTab(nextTab);

            return;
        }

        setPendingTab({
            title: 'Unsaved changes',
            description:
                'You have unsaved changes on the settings. Save them, or discard them before you switch tabs.',
            confirmLabel: 'Discard changes',
            icon: <TriangleAlert />,
            tone: 'danger',
            run: ({ onFinish }) => {
                form.reset();
                setActiveTab(nextTab);
                onFinish();
            },
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(SettingController.update.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const savedSettings = Object.fromEntries(
                    Object.entries(form.data.settings).map(([key, value]) => [
                        key,
                        value instanceof File ? null : value,
                    ]),
                );

                form.setData('settings', savedSettings);
                form.setDefaults('settings', savedSettings);
            },
        });
    };

    const resetFile = (key: string) => {
        router.delete(SettingController.resetFile.url(key), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Application settings" />

            <form noValidate onSubmit={submit}>
                <Card className="md:min-w-0">
                    <TabRoot
                        defaultValue={tabs[0]?.value ?? ''}
                        value={activeTab}
                        onValueChange={requestTab}
                        className="border-0 p-0"
                    >
                        <TabList className="bg-transparent!">
                            {tabs.map((tab) => (
                                <TabTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    icon={
                                        <DynamicIcon
                                            name={tab.icon as IconName}
                                        />
                                    }
                                >
                                    {tab.label}
                                </TabTrigger>
                            ))}
                        </TabList>

                        {tabs.map((tab) => (
                            <TabContent key={tab.value} value={tab.value}>
                                <CardContent className="pt-5">
                                    <FieldGroup>
                                        {fields
                                            .filter(
                                                (field) =>
                                                    field.tab === tab.value,
                                            )
                                            .map((field) => (
                                                <SettingFieldControl
                                                    key={field.key}
                                                    field={field}
                                                    value={
                                                        form.data.settings[
                                                            field.key
                                                        ] ?? null
                                                    }
                                                    error={
                                                        form.errors[
                                                            `settings.${field.key}`
                                                        ]
                                                    }
                                                    onChange={(value) =>
                                                        updateSetting(
                                                            field.key,
                                                            value,
                                                        )
                                                    }
                                                    onReset={() =>
                                                        resetFile(field.key)
                                                    }
                                                />
                                            ))}
                                    </FieldGroup>
                                </CardContent>
                            </TabContent>
                        ))}
                    </TabRoot>

                    <CardFooter className="flex justify-end pt-6">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            pending={form.processing}
                        >
                            Save
                        </Button>
                    </CardFooter>
                </Card>
            </form>

            <ResourceConfirmDialog
                pending={pendingTab}
                onClose={() => setPendingTab(null)}
                onConfirm={() =>
                    pendingTab?.run({ onFinish: () => setPendingTab(null) })
                }
            />
        </>
    );
}

Application.layout = {
    breadcrumbs: [
        {
            title: 'Application settings',
            href: SettingController.index.url(),
            icon: <Settings />,
        },
    ],
};
