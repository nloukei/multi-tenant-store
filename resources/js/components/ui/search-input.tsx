import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import * as React from 'react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({ className, containerClassName, ...props }, ref) => {
    return (
        <div className={cn('relative w-full', containerClassName)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
                type="search"
                ref={ref}
                className={cn('pl-10 focus:bg-white transition-all bg-neutral-100', className)}
                {...props}
            />
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export { SearchInput };
