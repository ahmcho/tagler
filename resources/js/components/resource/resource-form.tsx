import { router } from '@inertiajs/react';
import type { InertiaFormProps } from '@inertiajs/react';
import { Save, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
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

/** Visit options passed to the Inertia request on submit. */
export type ResourceSubmitOptions = {
    preserveScroll?: boolean;
    onSuccess?: () => void;
    onFinish?: () => void;
};

/** A model from the server. A new model has no `id`, so the form creates it. */
export type ResourceFormModel = {
    id?: number | string | null;
};

export type ResourceFormChildren =
    | ReactNode
    | ((state: { isCreating: boolean }) => ReactNode);

export type ResourceFormProps<TData extends Record<string, unknown>> = {
    model: ResourceFormModel;
    form: InertiaFormProps<TData>;
    /** POST target for a new model. `null` on edit pages. */
    storeUrl: string | null;
    /** PUT target for a saved model. `null` on create pages. */
    updateUrl: string | null;
    /** Card title is "New {resourceName}" or "Edit {resourceName}". */
    resourceName: string;
    description?: ReactNode;
    backHref: string;
    submitOptions?: ResourceSubmitOptions;
    children: ResourceFormChildren;
};

export type ResourceContentProps<TData extends Record<string, unknown>> =
    ResourceFormProps<TData> & {
        /** Document title, for example "New role". */
        pageTitle: string;
        status?: string | null;
    };

/**
 * The one create and edit form for resource pages. The model id decides the
 * mode: no id means create (POST to `storeUrl`), an id means update (PUT to
 * `updateUrl`). Fields read `isCreating` from the render function when they
 * differ between the two modes.
 */
export function ResourceForm<TData extends Record<string, unknown>>({
    model,
    form,
    storeUrl,
    updateUrl,
    resourceName,
    description,
    backHref,
    submitOptions,
    children,
}: ResourceFormProps<TData>) {
    const isCreating = !model.id;
    const url = isCreating ? storeUrl : updateUrl;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (url === null) {
            return;
        }

        form.submit(isCreating ? 'post' : 'put', url, submitOptions);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isCreating ? 'New' : 'Edit'} {resourceName}
                </CardTitle>
                {description && (
                    <CardDescription>{description}</CardDescription>
                )}
            </CardHeader>

            <form noValidate onSubmit={submit}>
                <CardContent>
                    <FieldGroup>
                        {typeof children === 'function'
                            ? children({ isCreating })
                            : children}
                    </FieldGroup>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 pt-6">
                    <Button
                        type="button"
                        appearance="outline"
                        onPress={() => router.visit(backHref)}
                    >
                        <X className="size-4" />
                        Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        pending={form.processing}
                    >
                        <Save className="size-4" />
                        {isCreating ? 'Create' : 'Save'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
