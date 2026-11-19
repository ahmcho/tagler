import { Form, Head } from '@inertiajs/react';
import { Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Modules/Auth/Controllers/SecurityController';
import { PasswordField } from '@/components/password-field';
import { Button } from '@/components/tailgrids/core/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/tailgrids/core/card';
import { FieldGroup } from '@/components/tailgrids/core/field';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

function SectionHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <CardHeader>
            <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </CardHeader>
    );
}

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Security settings" />

            <div className="space-y-6">
                <Card>
                    <SectionHeader
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />
                    <Form
                        noValidate
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                    >
                        {({ errors, processing }) => (
                            <>
                                <CardContent>
                                    <FieldGroup>
                                        <PasswordField
                                            name="current_password"
                                            inputRef={currentPasswordInput}
                                            label="Current password"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                            error={errors.current_password}
                                        />

                                        <PasswordField
                                            name="password"
                                            inputRef={passwordInput}
                                            label="New password"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                            error={errors.password}
                                        />

                                        <PasswordField
                                            name="password_confirmation"
                                            label="Confirm password"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                            error={errors.password_confirmation}
                                        />
                                    </FieldGroup>
                                </CardContent>

                                <CardFooter className="flex justify-end pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        pending={processing}
                                        data-test="update-password-button"
                                    >
                                        Save password
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Form>
                </Card>

                {canManageTwoFactor && (
                    <Card>
                        <SectionHeader
                            title="Two-factor authentication"
                            description="Manage your two-factor authentication settings"
                        />
                        <CardContent className="space-y-6 pb-5">
                            {twoFactorEnabled ? (
                                <>
                                    <p className="text-sm text-text-100">
                                        You will be prompted for a secure,
                                        random pin during login, which you can
                                        retrieve from the TOTP-supported
                                        application on your phone.
                                    </p>

                                    <Form noValidate {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="danger"
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Disable 2FA
                                            </Button>
                                        )}
                                    </Form>

                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-text-100">
                                        When you enable two-factor
                                        authentication, you will be prompted for
                                        a secure pin during login. This pin can
                                        be retrieved from a TOTP-supported
                                        application on your phone.
                                    </p>

                                    <div>
                                        {hasSetupData ? (
                                            <Button
                                                onPress={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                <ShieldCheck size={18} />
                                                Continue setup
                                            </Button>
                                        ) : (
                                            <Form
                                                noValidate
                                                {...enable.form()}
                                                onSuccess={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        pending={processing}
                                                    >
                                                        Enable 2FA
                                                    </Button>
                                                )}
                                            </Form>
                                        )}
                                    </div>
                                </>
                            )}

                            <TwoFactorSetupModal
                                isOpen={showSetupModal}
                                onClose={() => setShowSetupModal(false)}
                                requiresConfirmation={requiresConfirmation}
                                twoFactorEnabled={twoFactorEnabled}
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                clearSetupData={clearSetupData}
                                fetchSetupData={fetchSetupData}
                                errors={errors}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit().url,
            icon: <Settings />,
        },
    ],
};
