import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import * as React from 'react';

const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, style, ...props }, ref) => {
    const { tenant } = usePage<any>().props;
    const accent = tenant?.primary_color || '#1d4ed8';

    return (
        <Button
            ref={ref}
            className={cn('rounded-full shadow-md hover:opacity-90 text-white font-bold', className)}
            style={{ backgroundColor: accent, ...style }}
            {...props}
        />
    );
});

PrimaryButton.displayName = 'PrimaryButton';

export { PrimaryButton };
