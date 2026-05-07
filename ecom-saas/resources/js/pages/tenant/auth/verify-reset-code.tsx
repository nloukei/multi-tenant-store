// Tenant Verify Reset Code - Step 2
// Customer enters the 5-digit code from laravel.log
// Backend verifies the code
// If valid, redirects to Step 3 (reset password page)

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    email?: string;
    status?: string;
}

export default function TenantVerifyResetCode({ email = '', status }: Props) {
    // Form state: email, 5-digit code
    const { data, setData, post, processing, errors } = useForm<{
        email: string;
        code: string;
    }>({
        email,  // Pre-fill with email from previous step
        code: '',
    });

    // Handle form submission
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        // POST to /verify-reset-code (tenant.password.verify.store route)
        post(route('tenant.password.verify.store'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Verify Reset Code" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Verify 5-digit Code</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">Enter the code from laravel.log to continue.</p>

                {/* Display status message if exists (e.g., error) */}
                {status ? <p className="mt-4 rounded-md bg-[#eef7ee] p-3 text-sm text-[#195c19]">{status}</p> : null}

                <form className="mt-6 space-y-4" onSubmit={submit}>
                    {/* Email input (already filled from step 1) */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            autoComplete="email"
                            onChange={(event) => setData('email', event.target.value)}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* 5-digit code input (numeric only, max 5 chars) */}
                    <div className="grid gap-2">
                        <Label htmlFor="code">5-digit auth code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"  // Show number keyboard on mobile
                            maxLength={5}        // Max 5 digits
                            value={data.code}
                            // Only allow digits, strip other characters
                            onChange={(event) => setData('code', event.target.value.replace(/\D/g, '').slice(0, 5))}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.code} />
                    </div>

                    {/* Submit button */}
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Verifying code...' : 'Verify code'}
                    </Button>
                </form>

                {/* Link to regenerate a new code */}
                <p className="mt-4 text-center text-sm text-[#5d5c57]">
                    Need a new code?{' '}
                    <Link href={route('tenant.password.request')} className="font-medium text-[#1b1b18] underline">
                        Forgot password
                    </Link>
                </p>
            </div>
        </div>
    );
}
