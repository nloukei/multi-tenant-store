// Tenant Login Page — fully branded with store logo and primary color

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function TenantLogin() {
    const { tenant } = usePage<any>().props;
    const accent = tenant?.primary_color || '#1d4ed8';
    const logo = tenant?.logo_url;
    const storeName = tenant?.store_name || tenant?.id || 'Store';

    const { data, setData, post, processing, errors } = useForm<{
        email: string;
        password: string;
        remember: boolean;
    }>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('tenant.login.store'));
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f7f5] p-6">
            <Head title={`Login — ${storeName}`} />

            {/* Decorative background blobs using store brand color */}
            <div
                className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full opacity-[0.12] blur-3xl"
                style={{ backgroundColor: accent }}
            />
            <div
                className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full opacity-[0.12] blur-3xl"
                style={{ backgroundColor: accent }}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md">

                {/* Store branding header */}
                <div className="mb-8 flex flex-col items-center gap-3 text-center">
                    {logo ? (
                        <img src={logo} alt={storeName} className="h-14 w-auto max-w-[180px] object-contain" />
                    ) : (
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg"
                            style={{ backgroundColor: accent }}
                        >
                            {storeName[0].toUpperCase()}
                        </div>
                    )}
                    <div>
                        <p className="mt-0.5 text-sm text-neutral-500">Sign in to your account</p>
                    </div>
                </div>

                {/* Form card */}
                <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-8 shadow-sm">
                    <form className="space-y-5" onSubmit={submit}>
                        {/* Email */}
                        <div className="grid gap-1.5">
                            <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-11 rounded-xl border-neutral-200 bg-neutral-50 focus:border-transparent focus:ring-2"
                                style={{ '--tw-ring-color': accent } as React.CSSProperties}
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-semibold text-neutral-700">Password</Label>
                                <Link
                                    href={route('tenant.password.request')}
                                    className="text-xs font-medium hover:underline"
                                    style={{ color: accent }}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-11 rounded-xl border-neutral-200 bg-neutral-50"
                                required
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember me */}
                        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-600" htmlFor="remember">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-neutral-300"
                                style={{ accentColor: accent }}
                            />
                            Keep me signed in
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-full py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: accent }}
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-100" />
                        <span className="text-xs text-neutral-400">Don&apos;t have an account?</span>
                        <div className="h-px flex-1 bg-neutral-100" />
                    </div>

                    {/* Register link */}
                    <Link
                        href={route('tenant.register')}
                        className="block w-full rounded-full border py-3 text-center text-sm font-bold transition-colors hover:bg-neutral-50"
                        style={{ borderColor: accent, color: accent }}
                    >
                        Create Account
                    </Link>
                </div>

                {/* Back to store */}
                <p className="mt-6 text-center text-xs text-neutral-400">
                    <Link href={route('tenant.home')} className="hover:underline">
                        ← Back to store
                    </Link>
                </p>
            </div>
        </div>
    );
}
