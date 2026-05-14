import { TopBar } from '@/components/tenant/top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';
import { Package, ArrowLeft, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, Tag, Star } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/components/ui/toast';
import { useState } from 'react';

interface Review {
    id: number;
    customer_name?: string | null;
    rating: number;
    comment?: string | null;
    created_at: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    price: string | number;
    compare_at_price?: string | number | null;
    stock: number;
    sku?: string | null;
    image_url?: string | null;
    is_active?: boolean;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    reviews?: Review[];
}

interface Props {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: Props) {
    const { tenant } = usePage<any>().props;
    const { addToCart } = useCart(tenant.id);
    const accent = tenant.primary_color;
    const currency = tenant.currency || 'USD';
    const [quantity, setQuantity] = useState(1);

    const reviews = product.reviews || [];
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const price = Number(product.price);
    const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;
    const discount = comparePrice && comparePrice > price
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : null;

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        toast.success('Added to cart!', {
            description: (
                <div className="flex items-center gap-3 mt-1">
                    {product.image_url ? (
                        <img src={product.image_url} alt="" className="h-10 w-10 object-cover rounded-lg border" />
                    ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-neutral-100 rounded-lg border text-neutral-400">
                            <Package className="h-5 w-5" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 line-clamp-1">{product.name}</span>
                        <span className="text-xs text-neutral-500">{quantity}× added · Ready for checkout</span>
                    </div>
                </div>
            )
        });
        setQuantity(1);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`${product.name} - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-6xl px-6 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
                    <Link href="/" prefetch className="hover:text-neutral-900 transition-colors">Home</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <span className="hover:text-neutral-900 transition-colors cursor-default">{product.category.name}</span>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-neutral-900 font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="relative">
                        <div className="aspect-square overflow-hidden rounded-3xl bg-neutral-100 border border-neutral-200">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-neutral-300">
                                    <Package className="h-32 w-32 stroke-[0.5]" />
                                </div>
                            )}
                        </div>
                        {discount && (
                            <div
                                className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black text-white shadow-lg"
                                style={{ backgroundColor: accent }}
                            >
                                -{discount}% OFF
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        {/* Category Badge */}
                        {product.category && (
                            <span
                                className="text-xs font-bold uppercase tracking-widest mb-3 w-fit px-3 py-1 rounded-full"
                                style={{ backgroundColor: `${accent}15`, color: accent }}
                            >
                                {product.category.name}
                            </span>
                        )}

                        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
                            {product.name}
                        </h1>

                        {/* Reviews Summary Rating */}
                        {averageRating ? (
                            <a href="#reviews" className="flex items-center gap-2 mb-4 w-fit group">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-amber-500 text-amber-500' : 'text-neutral-200'}`} 
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-neutral-900 group-hover:underline">{averageRating}</span>
                                <span className="text-xs text-neutral-400 font-medium">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                            </a>
                        ) : (
                            <span className="text-xs text-neutral-400 italic mb-4 block">No reviews yet</span>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-black" style={{ color: accent }}>
                                {formatPrice(price)}
                            </span>
                            {comparePrice && comparePrice > price && (
                                <span className="text-lg text-neutral-400 line-through">
                                    {formatPrice(comparePrice)}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-6">
                            {product.stock > 0 ? (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-medium text-green-700">
                                        In Stock ({product.stock} available)
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <span className="text-sm font-medium text-red-600">Out of Stock</span>
                                </>
                            )}
                            {product.sku && (
                                <span className="text-xs text-neutral-400 ml-2">SKU: {product.sku}</span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">Description</h3>
                                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="p-3 hover:bg-neutral-50 transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                    className="p-3 hover:bg-neutral-50 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <PrimaryButton
                                className="flex-1 rounded-xl py-6 text-sm font-bold shadow-lg transition-all active:scale-[0.98] hover:shadow-xl gap-2"
                                onClick={handleAddToCart}
                                disabled={product.stock < 1}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                Add to Cart · {formatPrice(price * quantity)}
                            </PrimaryButton>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 mt-auto pt-6 border-t border-neutral-200">
                            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white border border-neutral-100">
                                <Truck className="h-5 w-5 text-neutral-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Fast Shipping</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white border border-neutral-100">
                                <Shield className="h-5 w-5 text-neutral-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Secure Payment</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white border border-neutral-100">
                                <RotateCcw className="h-5 w-5 text-neutral-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Easy Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Reviews Section */}
                <section id="reviews" className="mt-20 pt-12 border-t border-neutral-200 scroll-mt-24">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight mb-1">Customer Reviews</h2>
                            <p className="text-xs text-neutral-500 font-medium">Real feedback from verified purchasers</p>
                        </div>
                        {averageRating && (
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-neutral-200 shadow-xs">
                                <span className="text-2xl font-black text-neutral-900">{averageRating}</span>
                                <div>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-3.5 h-3.5 ${i < Math.round(Number(averageRating)) ? 'fill-amber-500 text-amber-500' : 'text-neutral-200'}`} 
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mt-0.5">Based on {reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-neutral-600 border border-neutral-200 shrink-0">
                                                    {(rev.customer_name || 'V')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-neutral-900 block leading-none">{rev.customer_name || 'Verified Purchaser'}</span>
                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Verified Purchase</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-neutral-400 font-medium">
                                                {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-200'}`} 
                                                />
                                            ))}
                                        </div>

                                        {rev.comment ? (
                                            <p className="text-sm text-neutral-700 leading-relaxed italic">"{rev.comment}"</p>
                                        ) : (
                                            <p className="text-xs text-neutral-400 italic">No text comment provided.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center shadow-xs">
                            <span className="text-sm font-bold text-neutral-400 block mb-1">No feedback published yet</span>
                            <p className="text-xs text-neutral-400 max-w-xs mx-auto">Orders delivered successfully will allow customers to write verified product reviews from their account.</p>
                        </div>
                    )}
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-2xl font-black tracking-tight mb-8">You might also like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/products/${related.slug}`}
                                    prefetch
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-xl hover:border-black/5"
                                >
                                    <div className="aspect-square overflow-hidden bg-neutral-50 relative">
                                        {related.image_url ? (
                                            <img
                                                src={related.image_url}
                                                alt={related.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                                <Package className="h-12 w-12 stroke-[1]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-bold line-clamp-2 leading-tight mb-2">{related.name}</h3>
                                        <span className="font-black text-lg">{formatPrice(Number(related.price))}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
