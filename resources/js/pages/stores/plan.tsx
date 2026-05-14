import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Store, CheckCircle2, AlertCircle, Check, Sparkles, ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle, CreditCard } from 'lucide-react';
import { themes } from '@/themes';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function StorePlan({ tenant, plans = [] }: { tenant: any; plans: any[] }) {
    const { flash } = usePage<any>().props;
    const currentPlan = tenant.plan || { name: 'Free', slug: 'free', price: '0.00', description: 'Basic tier' };
    const isCancelled = tenant.cancel_at_period_end === true;

    const { data, setData, patch, errors } = useForm({
        plan_slug: currentPlan.slug,
    });

    const [processingSlug, setProcessingSlug] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [resuming, setResuming] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: tenant.store_name || 'Store', href: route('stores.edit', tenant.id) },
        { title: 'Manage Subscription', href: '#' },
    ];

    const handleUpgrade = (slug: string) => {
        setProcessingSlug(slug);
        router.patch(route('stores.plan.update', tenant.id), { plan_slug: slug }, {
            preserveScroll: true,
            onFinish: () => setProcessingSlug(null),
        });
    };

    const handleCancelPlan = () => {
        setIsCancelModalOpen(true);
    };

    const executeCancelPlan = () => {
        setCancelling(true);
        router.post(route('stores.plan.cancel', tenant.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setCancelling(false);
                setIsCancelModalOpen(false);
            },
        });
    };

    const handleResumePlan = () => {
        setResuming(true);
        router.post(route('stores.plan.resume', tenant.id), {}, {
            preserveScroll: true,
            onFinish: () => setResuming(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subscription Plan - ${tenant.store_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <ConfirmModal 
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    onConfirm={executeCancelPlan}
                    title="Cancel Subscription"
                    description="Are you sure you want to schedule your subscription for cancellation? Benefits will remain active until next month."
                    confirmText="Schedule Cancellation"
                    variant="destructive"
                    loading={cancelling}
                />
                
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link href={route('stores.edit', tenant.id)} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Subscription & Plans</h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage billing tier and capabilities for <strong className="text-foreground">{tenant.store_name}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {flash.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {flash.message && (
                    <Alert className="border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="h-4 w-4 !text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Pending Cancellation Notice */}
                {isCancelled && (
                    <Alert className="border-amber-500/50 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
                                <AlertTitle className="font-bold mb-0">Cancellation Scheduled</AlertTitle>
                            </div>
                            <AlertDescription className="mt-2 text-xs leading-relaxed">
                                Your subscription has been scheduled for cancellation. Your premium capabilities will remain fully accessible until the start of next month (end of your current billing cycle), after which your store smoothly transitions back to the Free tier without any loss of critical store data.
                            </AlertDescription>
                        </div>
                        <div className="shrink-0">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={resuming}
                                onClick={handleResumePlan}
                                className="border-amber-600/30 text-amber-700 hover:bg-amber-600/10 dark:text-amber-400 dark:border-amber-400/30 dark:hover:bg-amber-400/10 text-xs font-bold"
                            >
                                {resuming ? 'Resuming...' : 'Resume Subscription'}
                            </Button>
                        </div>
                    </Alert>
                )}

                {/* Current Status Overview Card */}
                <div 
                    className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden"
                    style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}
                >
                    <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ background: themes.gradients.primary }} />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Subscription Tier</span>
                            <div className="flex items-center gap-3 mt-1">
                                <h2 className="text-2xl font-black text-foreground">{currentPlan.name} Plan</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10" style={{ color: themes.colors.primary.DEFAULT }}>
                                    ${parseFloat(currentPlan.price).toFixed(0)} / month
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Trial benefits or recurring capabilities activated for domain: <span className="font-mono text-foreground">{tenant.id}.tenantly.software</span>
                            </p>
                        </div>

                        {/* Cancellation Option Trigger */}
                        {currentPlan.slug !== 'free' && !isCancelled && (
                            <div>
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={cancelling}
                                    onClick={handleCancelPlan}
                                    className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all text-xs font-semibold h-9"
                                >
                                    {cancelling ? 'Scheduling...' : 'Cancel Subscription'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Plans Selection Grid */}
                <div className="space-y-4 pt-2">
                    <div>
                        <h3 className="text-lg font-bold">Available Tiers & Upgrades</h3>
                        <p className="text-xs text-muted-foreground">Select a plan below to instantly upgrade or switch your store capabilities.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {plans.map((plan: any) => {
                            const isCurrent = currentPlan.slug === plan.slug;
                            const isPro = plan.slug === 'pro';
                            const isUpdating = processingSlug === plan.slug;
                            const isPaid = parseFloat(plan.price) > 0;

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-300 ${
                                        isCurrent
                                            ? 'ring-2 shadow-md bg-primary/5 scale-[1.02]'
                                            : 'hover:border-primary/50 hover:bg-card/80'
                                    }`}
                                    style={{
                                        borderColor: isCurrent
                                            ? themes.colors.primary.DEFAULT
                                            : themes.colors.glass?.border || 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {isCurrent && (
                                        <span className="absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm bg-emerald-600 dark:bg-emerald-500">
                                            Current Tier
                                        </span>
                                    )}
                                    {isPro && (
                                        <span
                                            className="absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
                                            style={{ background: themes.gradients.primary }}
                                        >
                                            Popular
                                        </span>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-base">{plan.name}</span>
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                ${parseFloat(plan.price).toFixed(0)}/mo
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                                            {plan.description}
                                        </p>

                                        {plan.features && plan.features.length > 0 && (
                                            <ul className="mt-4 space-y-2 border-t pt-3">
                                                {plan.features.map((feat: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Check className="w-3.5 h-3.5 text-primary shrink-0" style={{ color: themes.colors.primary.DEFAULT }} />
                                                        <span className="truncate">{feat}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-3 border-t">
                                        {isCurrent ? (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                disabled
                                                className="w-full text-xs font-bold h-9 opacity-70"
                                            >
                                                Active Plan
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                disabled={processingSlug !== null}
                                                onClick={() => handleUpgrade(plan.slug)}
                                                className="w-full text-xs font-bold h-9 transition-all hover:opacity-90 shadow-sm flex items-center justify-center gap-1.5"
                                                style={{ background: themes.gradients.primary, color: themes.colors.text.primary }}
                                            >
                                                {isPaid && <CreditCard className="w-3.5 h-3.5 shrink-0" />}
                                                {isUpdating 
                                                    ? (isPaid ? 'Redirecting to Stripe...' : 'Switching...') 
                                                    : (isPaid ? `Upgrade with Stripe` : `Switch to ${plan.name}`)}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info block explaining transition timelines */}
                <div className="mt-4 grid gap-3.5 rounded-xl border p-4 bg-card/60 backdrop-blur-xs" style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}>
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5" style={{ color: themes.colors.primary.DEFAULT }}>
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themes.colors.primary.DEFAULT }}>
                                Immediate Upgrades
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Upgrades and switching to higher tiers take effect instantly upon approval, unlocking unlimited resource limits and prime backend operations for your storefront immediately.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 border-t pt-3">
                        <div className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0 mt-0.5">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                                Scheduled Cancellations
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                To ensure your storefront stability, cancellations are scheduled to take effect onto next month (the ending of your active period). Your features stay completely live during the transition window.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
