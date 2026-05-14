import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { themes } from '@/themes';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
    style?: React.CSSProperties;
}

export default function AuthSimpleLayout({ children, title, description, style }: AuthLayoutProps) {
    const themeVars = {
        '--background': themes.colors.background,
        '--foreground': themes.colors.text.primary,
        '--primary': themes.colors.primary.DEFAULT,
        '--ring': themes.colors.primary.light,
        '--border': themes.colors.glass.border,
        '--input': themes.colors.glass.border,
        colorScheme: 'dark',
        ...style,
    } as React.CSSProperties;

    return (
        <div 
            className="dark flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 text-white" 
            style={{ 
                ...themeVars,
                backgroundColor: themes.colors.background 
            }}
        >
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl p-2" style={{ background: themes.gradients.primary }}>
                                <AppLogoIcon className="size-full fill-current text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium text-white">{title}</h1>
                            <p className="text-center text-sm" style={{ color: themes.colors.text.secondary }}>{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
