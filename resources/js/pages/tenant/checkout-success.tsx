import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useCart } from '@/hooks/use-cart';

interface Props {
    tenant: any;
    sessionId: string;
    orderId: number | null;
    session: any;
}

export default function CheckoutSuccess({ tenant, sessionId, orderId, session }: Props) {
    const { clearCart } = useCart(tenant.id);
    const accent = tenant.primary_color;
    const [mounted, setMounted] = useState(false);

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    useEffect(() => {
        setMounted(true);
        // Clear the cart on successful checkout
        clearCart();
        
        // Trigger confetti for a premium feel
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null;

    const lineItems = session?.line_items?.data || [];

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717] pb-20">
            <Head title={`Payment Successful - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-3xl p-8 py-16 flex flex-col items-center">
                <div 
                    className="h-24 w-24 rounded-full flex items-center justify-center mb-8 shadow-inner"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                >
                    <CheckCircle2 className="h-12 w-12" />
                </div>

                <h1 className="text-4xl font-black tracking-tight mb-4 text-center">Payment Successful!</h1>
                <p className="text-neutral-500 text-lg mb-12 max-w-md text-center">
                    Thank you for your purchase. We've received your order and are getting it ready for shipment.
                </p>

                {/* Digital Receipt Card */}
                <div className="bg-white border border-neutral-200 rounded-3xl w-full shadow-sm mb-12 overflow-hidden">
                    <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Order Number</p>
                                <p className="font-black text-xl text-neutral-800">
                                    {orderId ? `#${orderId}` : '---'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Order Date</p>
                                <p className="font-bold text-neutral-700">
                                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date())}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Status</p>
                                <div className="flex items-center gap-2 text-green-600 font-extrabold uppercase text-sm tracking-wide">
                                    <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                                    Paid & Confirmed
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-neutral-100">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Customer Email</p>
                                <p className="font-medium text-neutral-600">
                                    {session?.customer_details?.email || 'Guest Customer'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Payment Method</p>
                                <p className="font-medium text-neutral-600 flex items-center gap-2">
                                    <span className="bg-neutral-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Stripe</span>
                                    Credit Card
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="p-8 space-y-6">
                        <h3 className="font-bold text-lg border-b pb-4">Order Details</h3>
                        {lineItems.length > 0 ? (
                            <div className="space-y-4">
                                {lineItems.map((item: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex gap-4 items-center">
                                            <div className="h-10 w-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-xs font-bold">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="font-bold">{item.description}</p>
                                                <p className="text-neutral-500 text-xs">Unit: {formatPrice(item.price.unit_amount, item.currency)}</p>
                                            </div>
                                        </div>
                                        <p className="font-black">{formatPrice(item.amount_total, item.currency)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-400 italic py-4">No item details available.</p>
                        )}

                        <div className="border-t pt-6 mt-6 space-y-2">
                            <div className="flex justify-between text-neutral-500 text-sm">
                                <span>Subtotal</span>
                                <span>{session ? formatPrice(session.amount_subtotal, session.currency) : '-'}</span>
                            </div>
                            <div className="flex justify-between text-neutral-500 text-sm">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold">Free</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t">
                                <span className="text-xl font-bold">Total Paid</span>
                                <span className="text-3xl font-black" style={{ color: accent }}>
                                    {session ? formatPrice(session.amount_total, session.currency) : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-neutral-50 px-8 py-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-2">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Transaction Reference</p>
                        <p className="text-[10px] font-mono text-neutral-400 break-all">{sessionId}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button asChild className="rounded-2xl px-8 h-14 font-bold shadow-lg transition-all hover:scale-[1.02]" style={{ backgroundColor: accent }}>
                        <Link href={route('tenant.home')}>
                            Continue Shopping
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="rounded-2xl px-8 h-14 font-bold border-neutral-200 hover:bg-neutral-50 transition-all">
                        <Link href={route('tenant.orders.index')}>
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            View Orders
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
