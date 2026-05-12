import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link } from '@inertiajs/react';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    tenant: any;
}

export default function CheckoutCancel({ tenant }: Props) {
    const accent = tenant.primary_color;

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`Order Cancelled - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-3xl p-8 py-20 flex flex-col items-center text-center">
                <div 
                    className="h-24 w-24 rounded-full flex items-center justify-center mb-8 bg-red-50 text-red-500"
                >
                    <XCircle className="h-12 w-12" />
                </div>

                <h1 className="text-4xl font-black tracking-tight mb-4">Checkout Cancelled</h1>
                <p className="text-neutral-500 text-lg mb-12 max-w-md">
                    No worries! Your payment was not processed. You can return to your cart to review your items or continue shopping.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button asChild className="rounded-2xl px-8 h-14 font-bold shadow-lg transition-all hover:scale-[1.02]" style={{ backgroundColor: accent }}>
                        <Link href={route('tenant.cart')}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Return to Cart
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="rounded-2xl px-8 h-14 font-bold border-neutral-200 hover:bg-neutral-50 transition-all">
                        <Link href={route('tenant.home')}>
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
