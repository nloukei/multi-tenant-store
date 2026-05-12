import { Head, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronDown, MapPin } from 'lucide-react';
import { StoreManagementTabs } from '@/components/store-management-tabs';
import { toast } from 'sonner';

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
    customer?: {
        name: string;
        email: string;
    };
    customer_location?: string | null;
}

interface Props {
    tenant: any;
    orders: Order[];
}

export default function StoreOrders({ tenant, orders }: Props) {
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

    const updateStatus = (orderId: number, status: string) => {
        const toastId = toast.loading('Updating order status...');
        router.patch(route('stores.orders.status', { tenant: tenant.id, order: orderId }), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Order #${orderId} status updated to ${status}`, { id: toastId });
            },
            onError: () => {
                toast.error('Failed to update order status', { id: toastId });
            }
        });
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-neutral-100 text-neutral-700',
        preparing: 'bg-amber-100 text-amber-700',
        shipping: 'bg-blue-100 text-blue-700',
        arrived: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-12">
            <Head title={`Manage Orders - ${tenant.store_name}`} />
            
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{tenant.store_name}</h1>
                        <p className="text-neutral-500 mt-1">Manage orders and fulfillments</p>
                    </div>
                </div>

                <StoreManagementTabs tenantId={tenant.id} activeTab="orders" />

                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden mt-6">
                    <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                        <div>
                            <h2 className="text-lg font-bold">Order Management</h2>
                            <p className="text-sm text-neutral-500">View and update customer orders.</p>
                        </div>
                    </div>

                    {orders.length > 0 ? (
                        <div className="divide-y divide-neutral-100">
                            {orders.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-neutral-50/50 transition-colors">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        {/* Order Details */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-black text-lg">Order #{order.id}</h3>
                                                    <p className="text-sm text-neutral-500">{formatDate(order.created_at)}</p>
                                                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                        {order.customer ? (
                                                            <div className="text-sm bg-neutral-100 inline-flex items-center px-3 py-1.5 rounded-lg border border-neutral-200">
                                                                <span className="font-bold mr-1">{order.customer.name}</span> &middot; <span className="ml-1">{order.customer.email}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm bg-neutral-100 inline-flex items-center px-3 py-1.5 rounded-lg border border-neutral-200">
                                                                <span className="font-bold italic text-neutral-500">Guest Checkout</span>
                                                            </div>
                                                        )}
                                                        {order.customer_location && (
                                                            <div className="text-sm bg-blue-50 text-blue-800 inline-flex items-center px-3 py-1.5 rounded-lg border border-blue-100 font-medium">
                                                                <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-blue-600" />
                                                                <span>{order.customer_location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Total</p>
                                                    <p className="font-black text-xl text-neutral-800">{formatPrice(order.total_amount, order.currency)}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white border border-neutral-200 rounded-lg p-4">
                                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 border-b pb-2">Purchased Items</p>
                                                <div className="space-y-2">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                                            <span className="font-medium text-neutral-700 flex items-center">
                                                                <span className="bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded text-xs mr-3">{item.quantity}x</span>
                                                                {item.product_name}
                                                            </span>
                                                            <span className="text-neutral-500 font-medium">{formatPrice(item.unit_price * item.quantity, order.currency)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Actions */}
                                        <div className="lg:w-72 shrink-0 flex flex-col justify-center bg-white border border-neutral-200 p-5 rounded-xl shadow-sm">
                                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 block text-center">Current Status</label>
                                            <div className="relative w-full">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`w-full appearance-none font-bold text-sm border-2 border-transparent px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition-colors cursor-pointer rounded-xl ${statusColors[order.status]}`}
                                                >
                                                    <option value="pending">⏳ Pending</option>
                                                    <option value="preparing">📦 Preparing Package</option>
                                                    <option value="shipping">🚚 Package is Shipping</option>
                                                    <option value="arrived">✅ Package Arrived</option>
                                                    <option value="cancelled">❌ Cancel Order</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                                            </div>
                                            <p className="text-[10px] text-neutral-400 mt-3 text-center uppercase tracking-wider font-bold">Changes auto-save</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center border-t border-neutral-100 bg-neutral-50/30">
                            <div className="h-20 w-20 bg-white shadow-sm border border-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="h-10 w-10 text-neutral-300" />
                            </div>
                            <h3 className="font-bold text-xl text-neutral-700 mb-2">No orders found</h3>
                            <p className="text-sm text-neutral-500 max-w-md mx-auto">Orders will appear here once customers checkout from your store.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
