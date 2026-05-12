import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CodeSent({ email, status }: { email?: string; status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email ?? '',
        code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.verify.code'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] p-6 text-[#1b1b18]">
            <Head title="Code Sent" />
            <div className="w-full max-w-md rounded-xl border border-[#dbdbd7] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold">Check your code</h1>
                <p className="mt-1 text-sm text-[#5d5c57]">A 5-digit code was generated and logged to laravel.log for now.</p>

                {status ? <p className="mt-4 rounded-md bg-[#eef7ee] p-3 text-sm text-[#195c19]">{status}</p> : null}

                <div className="mt-6 space-y-4">
                    <p className="text-sm text-[#5d5c57]">We sent the code for: <strong>{email}</strong></p>

                    <form onSubmit={submit}>
                        <div className="grid gap-2">
                            <Input
                                id="email"
                                name="email"
                                value={data.email}
                                onChange={(e: any) => setData('email', e.target.value)}
                                type="hidden"
                            />

                            <label htmlFor="code" className="text-sm font-medium text-[#1b1b18]">Enter 5-digit code</label>
                            <Input
                                id="code"
                                name="code"
                                type="text"
                                inputMode="numeric"
                                value={data.code}
                                onChange={(e: any) => setData('code', e.target.value)}
                                placeholder="12345"
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div className="my-4">
                            <Button className="w-full" disabled={processing}>
                                Verify code
                            </Button>
                        </div>
                    </form>

                    <Link
                        href={route('login')}
                        className="inline-block w-full rounded-md bg-[#1b1b18] px-4 py-2 text-center text-white"
                    >
                        Back to Sign in
                    </Link>

                    <p className="mt-4 text-sm text-[#5d5c57]">If you prefer, you can go to the code entry page for your tenant or central site.</p>
                </div>
            </div>
        </div>
    );
}
