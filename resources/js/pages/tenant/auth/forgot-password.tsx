// Tenant Forgot Password - Step 1
// Customer enters their email address
// Backend generates 5-digit code and logs it to laravel.log
// Then redirects to Step 2 (verify code page)

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function TenantForgotPassword({ status }: { status?: string }) {
    // Form state: only email needed
    const { data, setData, post, processing, errors } = useForm<{ email: string }>({
        email: '',
    });

    // Handle form submission
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        // POST to /forgot-password (tenant.password.email route)
        post(route('tenant.password.email'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Forgot Password" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Forgot Password</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">Enter your email. We will generate a 5-digit auth code.</p>

                {/* Display status message if exists (e.g., "Code generated") */}
                {status ? <p className="mt-4 rounded-md bg-[#eef7ee] p-3 text-sm text-[#195c19]">{status}</p> : null}

                <form className="mt-6 space-y-4" onSubmit={submit}>
                    {/* Email input */}
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

                    {/* Submit button */}
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Generating code...' : 'Generate 5-digit code'}
                    </Button>
                </form>

                {/* Link to verify code page (if already have code) */}
                <p className="mt-4 text-center text-sm text-[#5d5c57]">
                    Already have a code?{' '}
                    <Link href={route('tenant.password.verify', { email: data.email })} className="font-medium text-[#1b1b18] underline">
                        Verify code
                    </Link>
                </p>

                {/* Link back to login */}
                <p className="mt-2 text-center text-sm text-[#5d5c57]">
                    Back to{' '}
                    <Link href={route('tenant.login')} className="font-medium text-[#1b1b18] underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
