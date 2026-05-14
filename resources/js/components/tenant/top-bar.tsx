import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { SearchInput } from '@/components/ui/search-input';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, ShoppingBag, User, ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

interface TenantProps {
    id: string;
    store_name?: string | null;
    primary_color: string;
    logo_url?: string | null;
    categories?: Category[];
}

export function TopBar({ tenant }: { tenant: TenantProps }) {
    const { tenant_auth } = usePage<any>().props;
    const { totalItems } = useCart(tenant.id);
    const accent = tenant.primary_color;
    const categories = tenant.categories || [];

    return (
        <header className="border-b border-black/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-8 py-4">
                {/* Store Logo & Name */}
                <Link href={route('tenant.home')} prefetch className="flex items-center gap-3 shrink-0">
                    {tenant.logo_url ? (
                        <img src={tenant.logo_url} alt="" className="h-10 w-auto max-w-[150px] object-contain" />
                    ) : (
                        <span className="text-xl font-black uppercase tracking-tighter" style={{ color: accent }}>
                            {tenant.store_name || tenant.id}
                        </span>
                    )}
                </Link>

                {/* Search Bar */}
                <div className="hidden max-w-md flex-1 md:block">
                    <SearchInput 
                        placeholder="Search products..." 
                        className="focus:ring-2 focus:ring-offset-2 transition-all"
                        style={{ '--tw-ring-color': accent } as any}
                    />
                </div>

                {/* Right Side: Auth & Cart */}
                <div className="flex items-center gap-4">
                    {/* Cart Button */}
                    <Link 
                        href="/cart" 
                        prefetch
                        className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 transition-all hover:bg-neutral-200 cursor-pointer z-10"
                    >
                        <ShoppingCart className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-neutral-900" />
                        {totalItems > 0 && (
                            <span 
                                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[10px] font-black text-white shadow-sm"
                                style={{ backgroundColor: accent }}
                            >
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {tenant_auth && (
                        <Link 
                            href={route('tenant.orders.index')} 
                            prefetch
                            className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 transition-all hover:bg-neutral-200 cursor-pointer z-10"
                        >
                            <ShoppingBag className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-neutral-900" />
                        </Link>
                    )}

                    {tenant_auth ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SecondaryButton className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-2 hover:ring-2 transition-all" style={{ '--tw-ring-color': accent } as any}>
                                    <Avatar className="h-full w-full">
                                        <AvatarFallback style={{ backgroundColor: `${accent}15`, color: accent }} className="font-bold">
                                            {tenant_auth.name[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </SecondaryButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium text-sm">{tenant_auth.name}</p>
                                        <p className="w-[200px] truncate text-xs text-neutral-500">{tenant_auth.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="#" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/cart" className="cursor-pointer">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>Shopping Cart</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={route('tenant.orders.index')} className="cursor-pointer">
                                        <ShoppingBag className="mr-2 h-4 w-4" />
                                        <span>My Orders</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 cursor-pointer" asChild>
                                    <Link href={route('tenant.logout')} method="post" as="button" className="w-full text-left">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <SecondaryButton asChild className="hidden sm:flex">
                                <Link href={route('tenant.login')}>Login</Link>
                            </SecondaryButton>
                            <PrimaryButton asChild>
                                <Link href={route('tenant.register')}>Register</Link>
                            </PrimaryButton>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Navigation Bar */}
            <div className="border-t border-black/5 bg-neutral-50/50">
                <div className="mx-auto flex max-w-7xl items-center gap-6 px-8 py-2 overflow-x-auto no-scrollbar">
                    <Link
                        href={route('tenant.home')}
                        className="text-sm font-semibold text-neutral-900 hover:opacity-80 transition-all whitespace-nowrap relative group"
                        style={{ color: route().current('tenant.home') ? accent : undefined }}
                    >
                        Home
                        {route().current('tenant.home') && (
                            <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
                        )}
                    </Link>

                    {categories.map((category) => (
                        category.children && category.children.length > 0 ? (
                            <DropdownMenu key={category.id}>
                                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-neutral-600 hover:opacity-80 transition-all whitespace-nowrap focus:outline-none group">
                                    <span className="group-hover:text-neutral-900">{category.name}</span>
                                    <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48">
                                    {category.children.map(child => (
                                        <DropdownMenuItem key={child.id} asChild>
                                            <Link href={route('tenant.category.show', child.slug)} className="cursor-pointer w-full">
                                                {child.name}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={category.id}
                                href={route('tenant.category.show', category.slug)}
                                className="text-sm font-medium text-neutral-600 hover:opacity-80 transition-all whitespace-nowrap relative group"
                                style={{ color: route().current('tenant.category.show', category.slug) ? accent : undefined }}
                            >
                                {category.name}
                                {route().current('tenant.category.show', category.slug) && (
                                    <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
                                )}
                            </Link>
                        )
                    ))}

                    {/* Promos Tab */}
                    <Link
                        href="/promos"
                        prefetch
                        className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors whitespace-nowrap flex items-center gap-1.5"
                        style={{ color: accent }}
                    >
                        🔥 Promos
                    </Link>
                </div>
            </div>
        </header>
    );
}
