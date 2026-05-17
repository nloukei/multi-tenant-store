import { PrimaryButton } from '@/components/ui/primary-button';
import { Package } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Link, usePage } from '@inertiajs/react';
import { toast } from '@/components/ui/toast';

interface Product {
    id: number;
    name: string;
    price: string | number;
    image_url?: string;
    reviews_count?: number;
    reviews_avg_rating?: number | string | null;
}

export function ProductCard({ product, currency = 'USD' }: { product: Product, currency?: string }) {
    const { tenant } = usePage<any>().props;
    const { addToCart } = useCart(tenant.id);
    
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(Number(product.price));

    return (
        <div className="group relative flex flex-col overflow-hidden border border-neutral-200 bg-white transition-all hover:border-black/20">
            {/* Image section - clickable */}
            <Link href={`/products/${(product as any).slug || product.id}`} prefetch className="aspect-square overflow-hidden bg-neutral-50 relative block">
                {product.image_url ? (
                    <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <Package className="h-16 w-16 stroke-[1]" />
                    </div>
                )}
                
                {/* Subtle Overlay on Hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            </Link>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2">
                    <Link href={`/products/${(product as any).slug || product.id}`} prefetch>
                        <h3 className="line-clamp-2 text-base font-bold leading-tight text-neutral-900 transition-colors group-hover:text-black">
                            {product.name}
                        </h3>
                    </Link>
                </div>
                
                {/* Rating Block */}
                <div className="flex items-center gap-1.5 mb-4 text-xs">
                    <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const rating = Number(product.reviews_avg_rating) || 0;
                            const isFilled = i < Math.round(rating);
                            return (
                                <span key={i} className={isFilled ? "text-amber-500" : "text-neutral-200"}>
                                    ★
                                </span>
                            );
                        })}
                    </div>
                    {product.reviews_count && product.reviews_count > 0 ? (
                        <span className="text-neutral-500 font-medium">
                            {Number(product.reviews_avg_rating).toFixed(1)} ({product.reviews_count} {product.reviews_count === 1 ? 'review' : 'reviews'})
                        </span>
                    ) : (
                        <span className="text-neutral-400 italic">No reviews yet</span>
                    )}
                </div>
                
                <div className="mt-auto pt-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tight text-neutral-900">
                            {formattedPrice}
                        </span>
                    </div>
                    
                    <PrimaryButton 
                        className="mt-5 w-full rounded-none py-6 text-sm font-bold shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
                        onClick={() => {
                            addToCart(product);
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
                                            <span className="text-xs text-neutral-500">Ready for checkout</span>
                                        </div>
                                    </div>
                                )
                            });
                        }}
                    >
                        Add to Cart
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}
