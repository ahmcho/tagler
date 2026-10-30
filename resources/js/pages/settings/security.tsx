import {
    Button,
    Card,
    CardBody,
    CardHeader,
    PasswordInput,
} from '@ahmcho/tailadmin-react';
import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
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
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
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
                    <CardBody>
                        <Form
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
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <PasswordInput
                                        name="current_password"
                                        ref={currentPasswordInput}
                                        label="Current password"
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                        error={errors.current_password}
                                    />

                                    <PasswordInput
                                        name="password"
                                        ref={passwordInput}
                                        label="New password"
                                        autoComplete="new-password"
                                        placeholder="New password"
                                        error={errors.password}
                                    />

                                    <PasswordInput
                                        name="password_confirmation"
                                        label="Confirm password"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        error={errors.password_confirmation}
                                    />

                                    <div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            isLoading={processing}
                                            data-test="update-password-button"
                                        >
                                            Save password
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardBody>
                </Card>

                {canManageTwoFactor && (
                    <Card>
                        <SectionHeader
                            title="Two-factor authentication"
                            description="Manage your two-factor authentication settings"
                        />
                        <CardBody className="space-y-6">
                            {twoFactorEnabled ? (
                                <>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        You will be prompted for a secure,
                                        random pin during login, which you can
                                        retrieve from the TOTP-supported
                                        application on your phone.
                                    </p>

                                    <Form {...disable.form()}>
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        When you enable two-factor
                                        authentication, you will be prompted for
                                        a secure pin during login. This pin can
                                        be retrieved from a TOTP-supported
                                        application on your phone.
                                    </p>

                                    <div>
                                        {hasSetupData ? (
                                            <Button
                                                startIcon={
                                                    <ShieldCheck size={18} />
                                                }
                                                onClick={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                Continue setup
                                            </Button>
                                        ) : (
                                            <Form
                                                {...enable.form()}
                                                onSuccess={() =>
                                                    setShowSetupModal(true)
                                                }
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        isLoading={processing}
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
                        </CardBody>
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
        },
    ],
};
