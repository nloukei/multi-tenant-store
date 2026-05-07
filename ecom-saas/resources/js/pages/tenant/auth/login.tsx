// Tenant Login Page
// Shows email/password form for customers to log into their store
// Includes "Remember me" checkbox and links to registration and forgot password

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function TenantLogin() {
    // Form state: email, password, remember checkbox
    const { data, setData, post, processing, errors } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    // Handle form submission
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        // POST to /login (tenant.login.store route)
        post(route('tenant.login.store'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Tenant Login" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Tenant Login</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">Login to continue as admin or customer.</p>

                <form className="mt-6 space-y-4" onSubmit={submit}>
                    {/* Email input */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password input */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Forgot password link */}
                    <p className="text-right text-sm">
                        <Link href={route('tenant.password.request')} className="text-[#1b1b18] underline">
                            Forgot password?
                        </Link>
                    </p>

                    {/* Remember me checkbox */}
                    <label className="flex items-center gap-2 text-sm text-[#5d5c57]" htmlFor="remember">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) => setData('remember', event.target.checked)}
                        />
                        Remember me
                    </label>

                    {/* Submit button */}
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>

                {/* Link to registration page */}
                <p className="mt-4 text-center text-sm text-[#5d5c57]">
                    No account yet?{' '}
                    <Link href={route('tenant.register')} className="font-medium text-[#1b1b18] underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
