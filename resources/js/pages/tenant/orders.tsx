import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight, ShoppingBag, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
}

interface Review {
    id: number;
    product_name: string;
    rating: number;
    comment?: string | null;
    created_at: string;
}

interface Order {
    id: number;
    stripe_session_id: string;
    status: string;
    total_amount: number;
    currency: string;
    created_at: string;
    items: OrderItem[];
    reviews?: Review[];
    customer_location?: string | null;
}

interface Props {
    tenant: any;
    orders: Order[];
}

export default function OrderHistory({ tenant, orders }: Props) {
    const accent = tenant.primary_color;
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'completed'>('all');

    // Review Modal States
    const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
    const [reviewModalItem, setReviewModalItem] = useState<OrderItem | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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

    const tabs = [
        { id: 'all', label: 'All Orders' },
        { id: 'pending', label: 'Pending & Preparing' },
        { id: 'shipping', label: 'Shipping' },
        { id: 'completed', label: 'Completed' },
    ];

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return order.status === 'pending' || order.status === 'preparing';
        if (activeTab === 'shipping') return order.status === 'shipping';
        if (activeTab === 'completed') return order.status === 'arrived';
        return true;
    });

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewModalOrder || !reviewModalItem) return;

        setIsSubmittingReview(true);
        router.post(route('tenant.orders.reviews.store', reviewModalOrder.id), {
            product_name: reviewModalItem.product_name,
            rating: rating,
            comment: comment,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Thank you! Your review has been successfully published.');
                setReviewModalOrder(null);
                setReviewModalItem(null);
                setIsSubmittingReview(false);
            },
            onError: () => {
                toast.error('Failed to submit review. Please check your inputs and try again.');
                setIsSubmittingReview(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`My Orders - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-4xl p-8 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-neutral-400" />
                        Order History
                    </h1>
                </div>

                {/* Status Tabs Bar */}
                <div className="flex gap-2 overflow-x-auto pb-3 mb-8 border-b border-neutral-200 no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                                    isActive 
                                        ? 'bg-white shadow-sm border border-neutral-200' 
                                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50 border border-transparent'
                                }`}
                                style={isActive ? { borderColor: accent, color: accent } : undefined}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-bold text-lg">Order #{order.id}</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-neutral-500 font-medium">{formatDate(order.created_at)}</p>
                                        {order.customer_location && (
                                            <div className="mt-2 text-xs bg-neutral-100 text-neutral-700 inline-flex items-center px-2.5 py-1 rounded-md font-medium">
                                                <MapPin className="w-3 h-3 mr-1 shrink-0 text-neutral-500" />
                                                <span>{order.customer_location}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left md:text-right w-full md:w-auto bg-neutral-50 md:bg-transparent p-3 md:p-0 rounded-xl">
                                        <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="font-black text-xl" style={{ color: accent }}>{formatPrice(order.total_amount, order.currency)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Items</p>
                                    {order.items.map((item) => {
                                        const existingReview = order.reviews?.find(r => r.product_name === item.product_name);
                                        return (
                                            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 gap-3">
                                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                                    <div className="h-8 w-8 bg-white border border-neutral-200 rounded-md flex items-center justify-center text-xs font-bold text-neutral-500 shadow-sm shrink-0">
                                                        {item.quantity}x
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-neutral-900 line-clamp-1">{item.product_name}</p>
                                                        <p className="font-medium text-xs text-neutral-500">{formatPrice(item.unit_price * item.quantity, order.currency)}</p>
                                                    </div>
                                                </div>

                                                {/* Completed Order Review / E-commerce Rating Interface */}
                                                {order.status === 'arrived' && (
                                                    <div className="w-full sm:w-auto flex justify-end pt-2 sm:pt-0 border-t border-neutral-200/60 sm:border-t-0">
                                                        {existingReview ? (
                                                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-xs">
                                                                <div className="flex gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star 
                                                                            key={i} 
                                                                            className={`w-3 h-3 ${i < existingReview.rating ? 'fill-amber-500 text-amber-500' : 'text-neutral-200'}`} 
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-1.5 py-0.5 rounded">Reviewed</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setReviewModalOrder(order);
                                                                        setReviewModalItem(item);
                                                                        setRating(existingReview.rating);
                                                                        setComment(existingReview.comment || '');
                                                                    }}
                                                                    className="text-xs text-neutral-400 hover:text-neutral-900 font-bold ml-1 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs rounded-lg font-bold bg-white border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 w-full sm:w-auto shadow-xs"
                                                                onClick={() => {
                                                                    setReviewModalOrder(order);
                                                                    setReviewModalItem(item);
                                                                    setRating(5);
                                                                    setComment('');
                                                                }}
                                                            >
                                                                <Star className="w-3.5 h-3.5 mr-1.5 text-amber-500 fill-amber-500/20" /> Write a Review
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
                        <div className="h-20 w-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders found`}
                        </h2>
                        <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                            {activeTab === 'all' 
                                ? "Looks like you haven't made any purchases yet. Start shopping to see your orders here."
                                : "There are no orders matching this status at the moment."}
                        </p>
                        {activeTab === 'all' ? (
                            <Button asChild className="rounded-xl px-8 text-white font-bold" style={{ backgroundColor: accent }}>
                                <Link href={route('tenant.home')}>Start Shopping</Link>
                            </Button>
                        ) : (
                            <Button 
                                variant="outline" 
                                className="rounded-xl px-6 font-bold"
                                onClick={() => setActiveTab('all')}
                            >
                                View All Orders
                            </Button>
                        )}
                    </div>
                )}
            </main>

            {/* Leave a Review Modal */}
            <Dialog open={!!reviewModalOrder} onOpenChange={(open) => !open && setReviewModalOrder(null)}>
                <DialogContent className="sm:max-w-md bg-white text-neutral-900 border-neutral-200 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-neutral-900">Product Review</DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500">
                            Share your experience with <span className="font-bold text-neutral-900">{reviewModalItem?.product_name}</span> to help other shoppers.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitReview} className="space-y-5 my-2">
                        {/* Star Rating Picker */}
                        <div className="space-y-2 text-center bg-neutral-50 p-6 rounded-3xl border border-neutral-200/60 shadow-inner">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                Overall Rating
                            </label>
                            <div className="flex justify-center gap-2 py-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="p-1 transition-all duration-200 active:scale-90 hover:scale-125 focus:outline-none group"
                                    >
                                        <Star 
                                            className={`w-10 h-10 transition-all duration-300 ${
                                                star <= rating 
                                                    ? 'fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                                                    : 'text-neutral-200 group-hover:text-neutral-300'
                                            }`} 
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="min-h-[20px]">
                                <span className="text-xs font-bold text-amber-600 animate-in fade-in slide-in-from-top-1">
                                    {rating === 5 && 'Excellent! You loved it.'}
                                    {rating === 4 && 'Very Good! Recommended.'}
                                    {rating === 3 && 'Average. It was okay.'}
                                    {rating === 2 && 'Fair. Could be better.'}
                                    {rating === 1 && 'Poor. Not recommended.'}
                                </span>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-700 ml-1">
                                Review Comment <span className="text-neutral-400 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you like or dislike about this product? How is the quality?"
                                className="w-full text-sm bg-white border border-neutral-200 rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-neutral-100 focus:border-neutral-300 transition-all resize-none shadow-sm placeholder:text-neutral-400"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setReviewModalOrder(null)}
                                className="rounded-xl text-xs font-bold hover:bg-neutral-100 text-neutral-500"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="rounded-xl text-xs font-bold px-8 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-white"
                                style={{ backgroundColor: accent }}
                            >
                                {isSubmittingReview ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Publishing...</span>
                                    </div>
                                ) : (
                                    'Publish Review'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
