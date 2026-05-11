import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link } from '@inertiajs/react';
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface Order {
    id: number;
    stripe_session_id: string;
    status: string;
    total_amount: number;
    currency: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    tenant: any;
    orders: Order[];
}

export default function OrderHistory({ tenant, orders }: Props) {
    const accent = tenant.primary_color;

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600"><Clock className="w-3.5 h-3.5" /> Pending</span>;
            case 'preparing':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Package className="w-3.5 h-3.5" /> Preparing</span>;
            case 'shipping':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><Truck className="w-3.5 h-3.5" /> Shipping</span>;
            case 'arrived':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Arrived</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`My Orders - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-4xl p-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-neutral-400" />
                        Order History
                    </h1>
                </div>

                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-bold text-lg">Order #{order.id}</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="text-left md:text-right w-full md:w-auto bg-neutral-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="font-black text-xl" style={{ color: accent }}>{formatPrice(order.total_amount, order.currency)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Items</p>
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-8 bg-white border border-neutral-200 rounded-md flex items-center justify-center text-xs font-bold text-neutral-500 shadow-sm">
                                                    {item.quantity}x
                                                </div>
                                                <p className="font-bold text-sm">{item.product_name}</p>
                                            </div>
                                            <p className="font-medium text-sm text-neutral-600">{formatPrice(item.unit_price * item.quantity, order.currency)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
                        <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">Looks like you haven't made any purchases yet. Start shopping to see your orders here.</p>
                        <Button asChild className="rounded-xl px-8" style={{ backgroundColor: accent }}>
                            <Link href={route('tenant.home')}>Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
