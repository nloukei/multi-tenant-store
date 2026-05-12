// Tenant Reset Password - Step 3 (Final)
// Customer enters their new password (with confirmation)
// Code has already been verified in Step 2
// After submission, password is updated and customer is redirected to login

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

export default function TenantResetPassword({ email = '', status }: Props) {
    // Form state: email, password, password confirmation
    const { data, setData, post, processing, errors, reset } = useForm<{
        email: string;
        password: string;
        password_confirmation: string;
    }>({
        email,  // Pre-fill with email from previous steps
        password: '',
        password_confirmation: '',
    });

    // Handle form submission
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        // POST to /reset-password (tenant.password.update route)
        post(route('tenant.password.update'), {
            // Clear password fields after submission
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Reset Password" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Reset Password</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">Use the 5-digit auth code from laravel.log.</p>

                {/* Display status message if exists (e.g., success or error) */}
                {status ? <p className="mt-4 rounded-md bg-[#eef7ee] p-3 text-sm text-[#195c19]">{status}</p> : null}

                <form className="mt-6 space-y-4" onSubmit={submit}>
                    {/* Email input (pre-filled, read-only context) */}
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

                    {/* New password input */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm new password input (must match password field above) */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm new password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            variant="dark"
                            required
                        />
                    </div>

                    {/* Submit button */}
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Resetting password...' : 'Reset password'}
                    </Button>
                </form>

                {/* Link back to login */}
                <p className="mt-4 text-center text-sm text-[#5d5c57]">
                    Back to{' '}
                    <Link href={route('tenant.login')} className="font-medium text-[#1b1b18] underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
