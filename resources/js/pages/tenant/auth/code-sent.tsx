import { Head, Link } from '@inertiajs/react';

export default function CodeSent({ email, status }: { email?: string; status?: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Code Sent" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Check your code</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">A 5-digit code was generated and logged to laravel.log for now.</p>

                {status ? <p className="mt-4 rounded-md bg-[#eef7ee] p-3 text-sm text-[#195c19]">{status}</p> : null}

                <div className="mt-6 space-y-4">
                    <p className="text-sm text-[#5d5c57]">We sent the code for: <strong>{email}</strong></p>

                    <Link
                        href={route('tenant.password.verify', { email })}
                        className="inline-block w-full rounded-md bg-[#1b1b18] px-4 py-2 text-center text-white"
                    >
                        Enter 5-digit code
                    </Link>

                    <p className="mt-4 text-sm text-[#5d5c57]">
                        Back to{' '}
                        <Link href={route('tenant.login')} className="font-medium text-[#1b1b18] underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
