import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, CreditCard, MapPin, Check } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/skeletons/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    tenant: any;
}

export default function CartPage({ tenant }: Props) {
    const { tenant_auth } = usePage<any>().props;
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, isLoaded } = useCart(tenant.id);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [customerLocation, setCustomerLocation] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newLocationInput, setNewLocationInput] = useState('');
    const [isSavingLocation, setIsSavingLocation] = useState(false);

    const savedLocations: string[] = tenant_auth?.saved_locations || [];

    // Automatically select the first saved location if none is selected
    useEffect(() => {
        if (!customerLocation && savedLocations.length > 0) {
            setCustomerLocation(savedLocations[0]);
        }
        if (savedLocations.length === 0) {
            setIsAddingLocation(true);
        }
    }, [savedLocations, customerLocation]);
    const accent = tenant.primary_color;
    const currency = tenant.currency || 'USD';

    const handleInitiateCheckout = () => {
        if (cart.length === 0) return;

        if (!tenant_auth) {
            toast.error('Please login to proceed with checkout');
            router.visit(route('tenant.login'));
            return;
        }

        setShowPaymentModal(true);
    };

    const handleSaveNewLocation = () => {
        if (!newLocationInput.trim()) {
            toast.error('Please enter a valid delivery address/location');
            return;
        }

        setIsSavingLocation(true);
        router.post(route('tenant.locations.store'), {
            location: newLocationInput.trim(),
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCustomerLocation(newLocationInput.trim());
                setNewLocationInput('');
                setIsAddingLocation(false);
                toast.success('Delivery location saved successfully');
                setIsSavingLocation(false);
            },
            onError: (errors: any) => {
                toast.error(errors.location || 'Failed to save location');
                setIsSavingLocation(false);
            }
        });
    };

    const handleProcessPayment = async () => {
        if (cart.length === 0) return;

        if (!customerLocation.trim()) {
            toast.error('Please provide your delivery location before checking out');
            return;
        }

        setIsCheckingOut(true);
        try {
            const response = await axios.post(route('tenant.checkout'), {
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image_url: item.image_url,
                })),
                currency: currency,
                customer_location: customerLocation.trim(),
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to create checkout session');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.error || 'An error occurred during checkout');
        } finally {
            setIsCheckingOut(false);
        }
    };

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

                                {/* Chosen Location Summary */}
                                <div className="mb-6 bg-neutral-50 p-4 rounded-xl border border-neutral-200 shadow-xs">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Delivery Location
                                        </span>
                                        {customerLocation && (
                                            <span className="text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    {customerLocation ? (
                                        <p className="text-sm font-bold text-neutral-900 line-clamp-2">{customerLocation}</p>
                                    ) : (
                                        <p className="text-xs italic text-neutral-400">None selected (Choose at next step)</p>
                                    )}
                                </div>

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
                                <Button 
                                    onClick={handleInitiateCheckout}
                                    disabled={cart.length === 0}
                                    className="w-full rounded-xl py-6 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                                    style={{ backgroundColor: accent }}
                                >
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    {tenant_auth ? 'Proceed to Payment' : 'Login to Checkout'}
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

            {/* Payment & Delivery Inputs Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Payment & Delivery Details</DialogTitle>
                        <DialogDescription>
                            Please choose or add your final delivery destination before paying securely.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-2 space-y-4">
                        {/* Saved Locations Selector */}
                        {savedLocations.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                                    Saved Locations
                                </label>
                                <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                                    {savedLocations.map((loc, idx) => {
                                        const isSelected = customerLocation === loc;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => {
                                                    setCustomerLocation(loc);
                                                    setIsAddingLocation(false);
                                                }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                                    isSelected 
                                                        ? 'bg-primary/5 border-primary ring-1 ring-primary' 
                                                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                            >
                                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-primary border-primary text-white' : 'border-neutral-300'
                                                }`}>
                                                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                </div>
                                                <span className={`text-sm font-medium line-clamp-2 ${isSelected ? 'text-primary font-bold' : 'text-neutral-700'}`}>
                                                    {loc}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Add Location Button / Form Toggle */}
                        {!isAddingLocation ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingLocation(true)}
                                className="w-full rounded-xl border-dashed border-2 py-5 text-neutral-600 hover:text-neutral-900 font-bold"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add New Delivery Location
                            </Button>
                        ) : (
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                                    New Delivery Location
                                </label>
                                <textarea
                                    rows={2}
                                    value={newLocationInput}
                                    onChange={(e) => setNewLocationInput(e.target.value)}
                                    placeholder="Enter your complete delivery address, street, landmarks..."
                                    className="w-full text-sm bg-white border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none"
                                />
                                <div className="flex gap-2 justify-end">
                                    {savedLocations.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsAddingLocation(false)}
                                            className="rounded-lg text-xs"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSaveNewLocation}
                                        disabled={isSavingLocation || !newLocationInput.trim()}
                                        className="rounded-lg text-xs px-4 font-bold"
                                        style={{ backgroundColor: accent }}
                                    >
                                        {isSavingLocation ? 'Saving...' : 'Save Location'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t mt-2">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-sm font-bold text-neutral-600">Total Amount Payable</span>
                            <span className="text-lg font-black" style={{ color: accent }}>{formatPrice(totalPrice)}</span>
                        </div>
                        <Button
                            onClick={handleProcessPayment}
                            disabled={isCheckingOut || !customerLocation}
                            className="w-full rounded-xl py-6 font-bold shadow-md transition-all active:scale-[0.98]"
                            style={{ backgroundColor: accent }}
                        >
                            <CreditCard className="mr-2 h-5 w-5" />
                            {isCheckingOut ? 'Redirecting to Stripe...' : 'Pay Securely with Stripe'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
