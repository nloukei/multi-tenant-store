import { ProductCard } from '@/components/tenant/product-card';
import { TopBar } from '@/components/tenant/top-bar';
import { Head, usePage, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Package, Tag, Sparkles, Clock, ArrowRight, Percent, ShoppingBag, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    image_url?: string;
    reviews_count?: number;
    reviews_avg_rating?: number | string | null;
    compare_at_price?: string | null;
}

interface Banner { url: string; uploaded_at: string; }

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface PromoItem {
    id: number;
    title: string;
    code: string;
    discount_type: string;
    discount_value: string;
    ends_at?: string | null;
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
    hero_title?: string | null;
    hero_subtitle?: string | null;
    hero_button_text?: string | null;
    hero_button_link?: string | null;
    hero_alignment?: 'left' | 'center' | 'right';
}

interface Props {
    tenant: TenantProps;
    products: Product[];
    featured: Product[];
    newArrivals: Product[];
    categories: CategoryItem[];
    activePromos: PromoItem[];
}

/* ── Reusable section header ── */
function SectionHeader({ icon: Icon, title, subtitle, accent, href }: { icon: any; title: string; subtitle?: string; accent: string; href?: string }) {
    return (
        <div className="flex items-end justify-between mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-5 w-5" style={{ color: accent }} />
                    <h2 className="text-2xl font-black tracking-tight text-neutral-900">{title}</h2>
                </div>
                {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
            </div>
            {href && (
                <Link href={href} className="group flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: accent }}>
                    View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            )}
        </div>
    );
}

/* ── Horizontal scroll product row ── */
function ProductRow({ products, currency }: { products: Product[]; currency: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

    return (
        <div className="group/row relative">
            <div ref={ref} className="flex gap-0 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory">
                {products.map((p) => (
                    <div key={p.id} className="w-[260px] shrink-0 snap-start">
                        <ProductCard product={p} currency={currency} />
                    </div>
                ))}
            </div>
            {products.length > 4 && (
                <>
                    <button onClick={() => scroll(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow-lg p-2 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={() => scroll(1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 shadow-lg p-2 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </>
            )}
        </div>
    );
}

export default function Storefront({ tenant, products, featured = [], newArrivals = [], categories = [], activePromos = [] }: Props) {
    const { tenant_auth } = usePage<any>().props;
    const title = tenant.store_name || tenant.id;
    const accent = tenant.primary_color;
    const currency = tenant.currency || 'USD';

    // Banner Carousel
    const banners = tenant.banners || [];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % banners.length), 5000);
            return () => clearInterval(timer);
        }
    }, [banners.length]);

    const nextSlide = () => setCurrentSlide((p) => (p + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((p) => (p - 1 + banners.length) % banners.length);

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={title} />
            <TopBar tenant={tenant} />

            {/* ═══════════ PROMO ANNOUNCEMENT BAR ═══════════ */}
            {activePromos.length > 0 && (
                <div className="text-white text-center py-2 px-4 text-sm font-medium tracking-wide" style={{ backgroundColor: accent }}>
                    <div className="flex items-center justify-center gap-2 animate-pulse">
                        <Tag className="h-3.5 w-3.5" />
                        <span>
                            {activePromos[0].title} — Use code <strong className="font-black">{activePromos[0].code}</strong> for{' '}
                            {activePromos[0].discount_type === 'percentage'
                                ? `${Number(activePromos[0].discount_value)}% off`
                                : `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(activePromos[0].discount_value))} off`
                            }!
                        </span>
                    </div>
                </div>
            )}

            {/* ═══════════ HERO BANNER CAROUSEL ═══════════ */}
            <div className="group relative w-full overflow-hidden bg-neutral-200">
                <div className="relative aspect-[1800/558] w-full">
                    {banners.length > 0 ? (
                        <>
                            {banners.map((banner, index) => (
                                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                                    <img src={banner.url} alt={tenant.banner_text || `Slide ${index + 1}`} className="h-full w-full object-cover" />
                                </div>
                            ))}
                            {banners.length > 1 && (
                                <>
                                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/40 group-hover:opacity-100">
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white/40 group-hover:opacity-100">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                        {banners.map((_, i) => (
                                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}20 0%, ${accent}40 100%)` }}>
                            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: accent }} />
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: accent }} />
                            <div className="relative z-10 text-center space-y-4 px-6">
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-sm" style={{ color: accent }}>{title}</h2>
                                <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: accent }} />
                                <p className="text-neutral-500 font-medium tracking-wide">COMING SOON</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ═══════════ TRUST BADGES BAR ═══════════ */}
            <div className="border-y border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100">
                    {[
                        { icon: Truck, label: 'Fast Delivery', desc: 'Quick & reliable shipping' },
                        { icon: Shield, label: 'Secure Payment', desc: '100% protected checkout' },
                        { icon: RotateCcw, label: 'Easy Returns', desc: 'Hassle-free returns' },
                        { icon: Star, label: 'Top Quality', desc: 'Curated products only' },
                    ].map((b) => (
                        <div key={b.label} className="flex items-center gap-3 py-5 px-6 justify-center">
                            <b.icon className="h-5 w-5 shrink-0" style={{ color: accent }} />
                            <div>
                                <p className="text-sm font-bold text-neutral-900">{b.label}</p>
                                <p className="text-xs text-neutral-500">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-6 md:px-8">

                {/* ═══════════ SHOP BY CATEGORY ═══════════ */}
                {categories.length > 0 && (
                    <section className="py-12">
                        <SectionHeader icon={ShoppingBag} title="Shop by Category" subtitle="Browse our curated collections" accent={accent} />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/category/${cat.slug}`}
                                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 text-center transition-all hover:shadow-lg hover:border-transparent hover:-translate-y-1"
                                    style={{ '--hover-bg': `${accent}08` } as any}
                                >
                                    <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-colors" style={{ backgroundColor: `${accent}12` }}>
                                        <ShoppingBag className="h-5 w-5" style={{ color: accent }} />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-900 group-hover:text-black">{cat.name}</span>
                                    <span className="text-xs text-neutral-400 mt-1">{cat.products_count} {cat.products_count === 1 ? 'item' : 'items'}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══════════ FEATURED / TOP RATED ═══════════ */}
                {featured.length > 0 && (
                    <section className="py-12 border-t border-neutral-100">
                        <SectionHeader icon={Sparkles} title="Top Rated" subtitle="Our customers' favorite picks" accent={accent} />
                        <ProductRow products={featured} currency={currency} />
                    </section>
                )}

                {/* ═══════════ NEW ARRIVALS ═══════════ */}
                {newArrivals.length > 0 && (
                    <section className="py-12 border-t border-neutral-100">
                        <SectionHeader icon={Clock} title="New Arrivals" subtitle="Fresh drops just for you" accent={accent} />
                        <ProductRow products={newArrivals} currency={currency} />
                    </section>
                )}

                {/* ═══════════ PROMO CARDS ═══════════ */}
                {activePromos.length > 1 && (
                    <section className="py-12 border-t border-neutral-100">
                        <SectionHeader icon={Percent} title="Active Promotions" subtitle="Don't miss these deals" accent={accent} href="/promos" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activePromos.map((promo) => (
                                <Link
                                    href="/promos"
                                    key={promo.id}
                                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10" style={{ backgroundColor: accent }} />
                                    <div className="flex items-center gap-2 mb-3">
                                        <Tag className="h-4 w-4" style={{ color: accent }} />
                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                                            {promo.discount_type === 'percentage' ? `${Number(promo.discount_value)}% OFF` : `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(promo.discount_value))} OFF`}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-neutral-900 mb-1">{promo.title}</h3>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-mono font-bold text-neutral-700 tracking-wider border border-dashed border-neutral-300">
                                            {promo.code}
                                        </span>
                                        {promo.ends_at && (
                                            <span className="text-xs text-neutral-400">
                                                Expires {new Date(promo.ends_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ═══════════ ALL PRODUCTS GRID ═══════════ */}
                <section className="py-12 border-t border-neutral-100">
                    <SectionHeader icon={Package} title="All Products" subtitle={`${products.length} items available`} accent={accent} />
                    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product.id} product={product} currency={currency} />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <Package className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                                <p className="text-neutral-500 font-medium">No products available in this store yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-neutral-200 bg-white">
                <div className="mx-auto max-w-7xl px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Brand */}
                        <div>
                            {tenant.logo_url ? (
                                <img src={tenant.logo_url} alt="" className="h-8 w-auto mb-4" />
                            ) : (
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-4" style={{ color: accent }}>{title}</h3>
                            )}
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Your one-stop shop for quality products. We're committed to bringing you the best selection at amazing prices.
                            </p>
                        </div>
                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Home</Link></li>
                                <li><Link href="/promos" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Promotions</Link></li>
                                <li><Link href="/cart" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Shopping Cart</Link></li>
                            </ul>
                        </div>
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4">Categories</h4>
                                <ul className="space-y-2">
                                    {categories.slice(0, 6).map((cat) => (
                                        <li key={cat.id}>
                                            <Link href={`/category/${cat.slug}`} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                                                {cat.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-neutral-400">&copy; {new Date().getFullYear()} {title}. All rights reserved.</p>
                        <p className="text-xs text-neutral-300">
                            Powered by <span className="font-semibold" style={{ color: accent }}>Tenantly</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
