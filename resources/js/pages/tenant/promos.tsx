import { TopBar } from '@/components/tenant/top-bar';
import { Head, Link, usePage } from '@inertiajs/react';
import { Tag, ArrowLeft, Clock, Percent, DollarSign, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/toast';

interface Promo {
    id: number;
    title: string;
    description?: string | null;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: string | number;
    min_purchase?: string | number | null;
    starts_at?: string | null;
    ends_at?: string | null;
    is_active: boolean;
    image_url?: string | null;
}

interface Props {
    promos: Promo[];
}

export default function PromosPage({ promos }: Props) {
    const { tenant } = usePage<any>().props;
    const accent = tenant.primary_color;
    const currency = tenant.currency || 'USD';
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Code copied!', {
            description: (
                <span className="font-mono font-bold">{code}</span>
            ),
        });
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const activePromos = promos.filter(p => {
        if (!p.is_active) return false;
        const now = new Date();
        if (p.ends_at && new Date(p.ends_at) < now) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`Promos & Deals - ${tenant.store_name}`} />
            <TopBar tenant={tenant} />

            <main className="mx-auto max-w-5xl p-8">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/" prefetch className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Promos & Deals</h1>
                        <p className="text-neutral-500 text-sm mt-0.5">{activePromos.length} active {activePromos.length === 1 ? 'offer' : 'offers'} available</p>
                    </div>
                </div>

                {activePromos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activePromos.map((promo) => {
                            const isPercentage = promo.discount_type === 'percentage';
                            return (
                                <div
                                    key={promo.id}
                                    className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-xl hover:border-black/5"
                                >
                                    {/* Banner / Header */}
                                    {promo.image_url ? (
                                        <div className="aspect-[21/9] overflow-hidden">
                                            <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        </div>
                                    ) : (
                                        <div
                                            className="aspect-[21/9] flex items-center justify-center"
                                            style={{ background: `linear-gradient(135deg, ${accent}20 0%, ${accent}05 100%)` }}
                                        >
                                            <div className="text-center">
                                                <span className="text-5xl font-black" style={{ color: accent }}>
                                                    {isPercentage ? `${promo.discount_value}%` : formatPrice(Number(promo.discount_value))}
                                                </span>
                                                <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: accent }}>
                                                    OFF
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h3 className="text-lg font-black leading-tight">{promo.title}</h3>
                                            <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black text-white" style={{ backgroundColor: accent }}>
                                                {isPercentage ? (
                                                    <><Percent className="h-3 w-3" />{promo.discount_value}%</>
                                                ) : (
                                                    <><DollarSign className="h-3 w-3" />{promo.discount_value}</>
                                                )}
                                            </div>
                                        </div>

                                        {promo.description && (
                                            <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{promo.description}</p>
                                        )}

                                        {promo.min_purchase && (
                                            <p className="text-xs text-neutral-400 mb-4">
                                                Min. purchase: {formatPrice(Number(promo.min_purchase))}
                                            </p>
                                        )}

                                        {/* Date Range */}
                                        {(promo.starts_at || promo.ends_at) && (
                                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-5">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>
                                                    {formatDate(promo.starts_at) && `From ${formatDate(promo.starts_at)}`}
                                                    {promo.ends_at && ` until ${formatDate(promo.ends_at)}`}
                                                </span>
                                            </div>
                                        )}

                                        {/* Code Copy */}
                                        <button
                                            onClick={() => copyCode(promo.code)}
                                            className="w-full flex items-center justify-between gap-2 p-3 rounded-xl border-2 border-dashed transition-all hover:border-solid"
                                            style={{ borderColor: `${accent}40` }}
                                        >
                                            <span className="font-mono text-sm font-black tracking-widest" style={{ color: accent }}>{promo.code}</span>
                                            {copiedCode === promo.code ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4 text-neutral-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-neutral-200 rounded-3xl">
                        <div className="h-24 w-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                            <Tag className="h-10 w-10 text-neutral-300" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No promos available</h2>
                        <p className="text-neutral-500 mb-8 max-w-xs text-center">Check back later for exclusive deals and discounts.</p>
                        <Link
                            href="/"
                            prefetch
                            className="px-8 py-3 rounded-xl text-white font-bold transition-all active:scale-[0.98]"
                            style={{ backgroundColor: accent }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
