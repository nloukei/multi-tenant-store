import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'> & {
    /**
     * Optional visual variant. Use `dark` when the input has a dark background
     * so the component applies accessible text/placeholder colors.
     */
    variant?: 'default' | 'dark';
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, variant = 'default', ...props }, ref) => {
    // Base classes used application-wide
    const base = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

    // Dark variant ensures readable text on dark backgrounds
    const darkClasses = 'bg-black text-white placeholder:text-gray-400';

    return (
        <input
            type={type}
            className={cn(base, variant === 'dark' ? darkClasses : '', className)}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export { Input };
