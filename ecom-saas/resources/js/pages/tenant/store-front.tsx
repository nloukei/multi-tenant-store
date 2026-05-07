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
import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, ShoppingBag, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
    id: number;
    name: string;
    price: string;
}

interface Banner {
    url: string;
    uploaded_at: string;
}

interface TenantProps {
    id: string;
    store_name?: string | null;
    primary_color: string;
    logo_url?: string | null;
    banners?: Banner[] | null;
    banner_text?: string | null;
    trial_ends_at?: string | null;
}

interface Props {
    tenant: TenantProps;
    products: Product[];
}

export default function Storefront({ tenant, products }: Props) {
    const { tenant_auth } = usePage<any>().props;
    const title = tenant.store_name || tenant.id;
    const accent = tenant.primary_color;
    
    // Carousel State
    const banners = tenant.banners || [];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [banners.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={title} />
            <header className="border-b border-black/10 bg-white/80 px-8 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-8">
                    {/* Store Logo & Name */}
                    <Link href={route('tenant.home')} className="flex items-center gap-3 shrink-0">
                        {tenant.logo_url ? (
                            <img src={tenant.logo_url} alt="" className="h-10 w-auto max-w-[150px] object-contain" />
                        ) : null}
                        <h1 className="text-xl font-extrabold tracking-tight" style={{ color: accent }}>
                            {title}
                        </h1>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden max-w-md flex-1 md:block">
                        <SearchInput placeholder="Search products..." />
                    </div>

                    {/* Right Side: Auth & Cart */}
                    <div className="flex items-center gap-2">
                        {tenant_auth ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SecondaryButton className="relative h-10 w-10 rounded-full p-0">
                                        <Avatar className="h-9 w-9 border border-neutral-200">
                                            <AvatarFallback style={{ backgroundColor: `${accent}15`, color: accent }}>
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
                                        <Link href="#" className="cursor-pointer">
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            <span>My Orders</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 cursor-pointer" asChild>
                                        <Link href={route('tenant.logout')} method="post" as="button" className="w-full">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <SecondaryButton asChild>
                                    <Link href={route('tenant.login')}>Login</Link>
                                </SecondaryButton>
                                <PrimaryButton asChild>
                                    <Link href={route('tenant.register')}>Join Store</Link>
                                </PrimaryButton>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            {/* Marketing Banner Carousel */}
            <div className="group relative w-full overflow-hidden bg-neutral-200">
                <div className="relative aspect-[1800/558] w-full">
                    {banners.length > 0 ? (
                        <>
                            {banners.map((banner, index) => (
                                <div 
                                    key={index} 
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <img 
                                        src={banner.url} 
                                        alt={tenant.banner_text || `Slide ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                            
                            {/* Overlay Text */}
                            {tenant.banner_text && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                    <h2 className="text-4xl md:text-7xl font-black text-white drop-shadow-2xl text-center uppercase tracking-tighter px-4">
                                        {tenant.banner_text}
                                    </h2>
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {banners.length > 1 && (
                                <>
                                    <button 
                                        onClick={prevSlide}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/40 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button 
                                        onClick={nextSlide}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/40 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                    
                                    {/* Indicators */}
                                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                        {banners.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentSlide(i)}
                                                className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        /* Fallback if no banners */
                        <div className="flex h-full items-center justify-center bg-neutral-100">
                             <img 
                                src="/Assasin-Sliding-ecom-MAIN_1800x.webp" 
                                alt="Default Banner"
                                className="h-full w-full object-cover opacity-50 grayscale"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-neutral-400 font-medium">Welcome to {title}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-5xl p-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="rounded-lg border border-black/10 bg-white p-4 shadow-sm"
                            >
                                <h2 className="font-semibold">{product.name}</h2>
                                <p className="text-neutral-600">${product.price}</p>
                                <PrimaryButton className="mt-3 w-full">
                                    Add to Cart
                                </PrimaryButton>
                            </div>
                        ))
                    ) : (
                        <p className="text-neutral-600">No products available in this store yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
