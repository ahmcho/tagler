import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { Ref } from 'react';
import { Button } from '@/components/tailgrids/core/button';
import { FieldError, FieldLabel } from '@/components/tailgrids/core/field';
import { Input } from '@/components/tailgrids/core/input';
import type { TextFieldProps } from '@/components/tailgrids/core/text-field';
import { TextField } from '@/components/tailgrids/core/text-field';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'children'> & {
    label: string;
    error?: string;
    placeholder?: string;
    autoComplete?: string;
    tabIndex?: number;
    inputRef?: Ref<HTMLInputElement>;
};

export function PasswordField({
    label,
    error,
    placeholder,
    autoComplete,
    tabIndex,
    inputRef,
    ...props
}: PasswordFieldProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <TextField
            {...props}
            type={isVisible ? 'text' : 'password'}
            invalid={Boolean(error)}
            className="flex w-full flex-col gap-1.5"
        >
            <FieldLabel>{label}</FieldLabel>
            <div className="relative w-full">
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    tabIndex={tabIndex}
                    className="w-full pr-11"
                />
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-2 my-auto size-8 justify-center p-0"
                    onPress={() => setIsVisible(!isVisible)}
                >
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
            </div>
            <FieldError>{error}</FieldError>
        </TextField>
    );
}
