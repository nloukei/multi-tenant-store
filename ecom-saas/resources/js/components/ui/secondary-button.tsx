import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as React from 'react';

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant="ghost"
            className={cn('text-neutral-900 hover:bg-neutral-100 font-semibold', className)}
            {...props}
        />
    );
});

SecondaryButton.displayName = 'SecondaryButton';

export { SecondaryButton };
