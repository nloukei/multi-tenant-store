import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/skeletons/skeleton';

interface Props {
    tenant: any;
}

export default function CartPage({ tenant }: Props) {
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, isLoaded } = useCart(tenant.id);
    const accent = tenant.primary_color;
    const currency = tenant.currency || 'USD';

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`Shopping Cart - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-5xl p-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href={route('tenant.home')} prefetch className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight">Your Cart</h1>
                    <span className="bg-neutral-200 px-3 py-1 rounded-full text-sm font-bold">{totalItems} items</span>
                </div>

                {!isLoaded ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-6 p-4 bg-white border border-neutral-200 rounded-2xl">
                                    <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                        <div className="flex gap-4 mt-3">
                                            <Skeleton className="h-10 w-24 rounded-lg" />
                                            <Skeleton className="h-10 w-10 rounded-lg" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-8 w-20" />
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                                <Skeleton className="h-7 w-1/2 mb-6" />
                                <div className="space-y-4 mb-6">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <div className="border-t pt-4">
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                </div>
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                ) : cart.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center gap-6 p-4 bg-white border border-neutral-200 rounded-2xl">
                                    <div className="h-24 w-24 rounded-xl bg-neutral-50 border overflow-hidden shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-neutral-300">
                                                <ShoppingBag className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                                        <p className="text-neutral-500 font-medium">{formatPrice(Number(item.price))}</p>

                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-neutral-50 transition-colors"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-10 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-neutral-50 transition-colors"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-xl">{formatPrice(Number(item.price) * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sticky top-24 shadow-sm">
                                <h2 className="text-xl font-black mb-6">Order Summary</h2>
                                <div className="space-y-4 mb-6 text-sm">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-neutral-900">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-bold uppercase tracking-wider text-[10px]">Calculated at next step</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <span className="text-lg font-bold">Total</span>
                                        <span className="text-2xl font-black" style={{ color: accent }}>{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                                <Button className="w-full rounded-xl py-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" style={{ backgroundColor: accent }}>
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Checkout
                                </Button>
                                <p className="text-[10px] text-center text-neutral-400 mt-4 uppercase tracking-widest font-bold">
                                    Secure Payment Powered by {tenant.store_name}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-neutral-200 rounded-3xl">
                        <div className="h-24 w-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                        <p className="text-neutral-500 mb-8 max-w-xs text-center">Looks like you haven't added anything to your cart yet.</p>
                        <Button asChild className="rounded-xl px-8" style={{ backgroundColor: accent }}>
                            <Link href={route('tenant.home')} prefetch>Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
