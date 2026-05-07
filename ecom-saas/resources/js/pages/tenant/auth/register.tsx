// Tenant Registration Page
// Allows customers to create a new account in a store
// Collects: name, email, password (with confirmation)
// After signup, customer is automatically logged in

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function TenantRegister() {
    // Form state: name, email, password, password confirmation
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Handle form submission
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        // POST to /register (tenant.register.store route)
        post(route('tenant.register.store'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Tenant Register" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Create Customer Account</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">Register to shop in this store tenant.</p>

                <form className="mt-6 space-y-4" onSubmit={submit}>
                    {/* Full name input */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            autoComplete="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

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
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            variant="dark"
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm password input */}
                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
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
                        {processing ? 'Creating account...' : 'Create account'}
                    </Button>
                </form>

                {/* Link to login page */}
                <p className="mt-4 text-center text-sm text-[#5d5c57]">
                    Already have an account?{' '}
                    <Link href={route('tenant.login')} className="font-medium text-[#1b1b18] underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
