import { ProductCard } from '@/components/tenant/product-card';
import { TopBar } from '@/components/tenant/top-bar';
import { Head, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    image_url?: string;
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
    currency?: string | null;
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
            
            <TopBar tenant={tenant} />

            {/* Marketing Banner Carousel */}

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
                        /* Branded Fallback if no banners */
                        <div
                            className="flex h-full w-full items-center justify-center relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${accent}20 0%, ${accent}40 100%)`,
                            }}
                        >
                            {/* Decorative Brand Circles */}
                            <div
                                className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20"
                                style={{ backgroundColor: accent }}
                            />
                            <div
                                className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20"
                                style={{ backgroundColor: accent }}
                            />

                            <div className="relative z-10 text-center space-y-4 px-6">
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-sm" style={{ color: accent }}>
                                    {title}
                                </h2>
                                <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: accent }} />
                                <p className="text-neutral-500 font-medium tracking-wide">COMING SOON</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-7xl p-8">
                <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                currency={tenant.currency || 'USD'} 
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <Package className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                            <p className="text-neutral-500 font-medium">No products available in this store yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
