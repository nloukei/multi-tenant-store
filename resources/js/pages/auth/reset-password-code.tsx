import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function ResetPasswordCode({ email, status }: { email?: string; status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.update.code'));
    };

    return (
        <AuthLayout title="Reset password" description="Set a new password for your account">
            <Head title="Reset password" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Input
                            id="email"
                            name="email"
                            value={data.email}
                            onChange={(e: any) => setData('email', e.target.value)}
                            type="hidden"
                        />

                        <label className="text-sm font-medium text-[#1b1b18]">New password</label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={(e: any) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} />

                        <label className="text-sm font-medium text-[#1b1b18]">Confirm password</label>
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e: any) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full" disabled={processing}>
                            Reset password
                        </Button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
