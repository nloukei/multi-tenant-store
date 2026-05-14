import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { themes } from '@/themes';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout 
            title="Log in to your account" 
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" style={{ color: themes.colors.text.primary }}>Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            variant="dark"
                            className="border-white/10 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                            style={{ 
                                background: themes.colors.glass.background,
                            }}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" style={{ color: themes.colors.text.primary }}>Password</Label>
                            {canResetPassword && (
                                <TextLink 
                                    href={route('password.request')} 
                                    className="ml-auto text-sm transition-opacity hover:opacity-80" 
                                    tabIndex={5}
                                    style={{ color: themes.colors.secondary.light }}
                                >
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            variant="dark"
                            className="border-white/10 focus-visible:ring-primary/30 focus-visible:border-primary/50"
                            style={{ 
                                background: themes.colors.glass.background,
                            }}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox 
                            id="remember" 
                            name="remember" 
                            tabIndex={3} 
                            className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor="remember" className="text-sm cursor-pointer transition-colors hover:text-white" style={{ color: themes.colors.text.secondary }}>
                            Remember me
                        </Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 w-full h-11 font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98]" 
                        tabIndex={4} 
                        disabled={processing}
                        style={{ 
                            background: themes.gradients.primary,
                            border: 'none',
                        }}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm" style={{ color: themes.colors.text.primary }}>
                    <span style={{ color: themes.colors.text.secondary }}>Don't have an account?</span>{' '}
                    <TextLink 
                        href={route('register')} 
                        tabIndex={5}
                        className="transition-opacity hover:opacity-80 font-medium"
                        style={{ color: themes.colors.secondary.light }}
                    >
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && (
                <div 
                    className="mt-4 text-center text-sm font-medium" 
                    style={{ color: themes.colors.success.DEFAULT }}
                >
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
