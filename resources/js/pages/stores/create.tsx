import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Store, CheckCircle2, AlertCircle, Check, Sparkles, ShieldCheck, ExternalLink, LayoutDashboard, PartyPopper, XCircle } from 'lucide-react';
import { themes } from '@/themes';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Create Store',
        href: '/stores/create',
    },
];

export default function CreateStore() {
    const { flash, plans = [], current_plan_slug, auth } = usePage<any>().props;
    const currentPlanSlug = current_plan_slug || auth?.user?.plan?.slug || null;

    const [createdStoreUrl, setCreatedStoreUrl] = useState<string | null>(null);
    const [createdStoreName, setCreatedStoreName] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: '',
        subdomain: '',
        primary_color: '#1d4ed8',
        banner_text: '',
        logo_url: '',
        plan_slug: currentPlanSlug || 'free',
    });

    const submitStore = (e: React.FormEvent) => {
        e.preventDefault();
        const storeName = data.store_name;
        const subdomain = data.subdomain;
        post(route('stores.store'), {
            onSuccess: (page: any) => {
                const domain = page.props.flash?.new_store_domain;
                const msg = page.props.flash?.message || 'Store created successfully!';
                if (domain) {
                    const protocol = window.location.protocol;
                    const port = window.location.port ? ':' + window.location.port : '';
                    const storeUrl = `${protocol}//${domain}${port}`;
                    setCreatedStoreUrl(storeUrl);
                    setCreatedStoreName(storeName || subdomain);
                    setSuccessMessage(msg);
                    setErrorMessage(null);
                    window.open(storeUrl, '_blank');
                } else {
                    setSuccessMessage(msg);
                    setCreatedStoreUrl(null);
                }
                setShowModal(true);
                reset();
            },
            onError: (errs: any) => {
                const firstError = Object.values(errs)[0] as string;
                setErrorMessage(firstError || 'Something went wrong. Please try again.');
                setSuccessMessage(null);
                setCreatedStoreUrl(null);
                setShowModal(true);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Store" />

            {/* ── Result Modal ── */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    {successMessage ? (
                        /* ── Success ── */
                        <>
                            <DialogHeader>
                                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                                    <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <DialogTitle className="text-center text-xl">Store Created! 🎉</DialogTitle>
                                <DialogDescription className="text-center">
                                    <span className="font-semibold text-foreground">{createdStoreName}</span> is now live and has been opened in a new tab.
                                </DialogDescription>
                            </DialogHeader>

                            {createdStoreUrl && (
                                <div className="rounded-lg border border-green-500/30 bg-green-50 dark:bg-green-950/30 px-4 py-3 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Your store URL</p>
                                    <a
                                        href={createdStoreUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-sm font-semibold text-green-700 dark:text-green-400 underline underline-offset-2 break-all hover:opacity-80 transition-opacity"
                                    >
                                        {createdStoreUrl}
                                    </a>
                                </div>
                            )}

                            <DialogFooter className="flex-col gap-2 sm:flex-col">
                                {createdStoreUrl && (
                                    <Button
                                        asChild
                                        className="w-full gap-2 font-semibold"
                                        style={{ background: themes.gradients.primary, color: themes.colors.text.primary }}
                                    >
                                        <a href={createdStoreUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                            Open {createdStoreName || 'Store'}
                                        </a>
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="w-full gap-2">
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="h-4 w-4" />
                                        Go to Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-muted-foreground"
                                    onClick={() => setShowModal(false)}
                                >
                                    Create Another Store
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        /* ── Error ── */
                        <>
                            <DialogHeader>
                                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                                <DialogTitle className="text-center text-xl">Store Creation Failed</DialogTitle>
                                <DialogDescription className="text-center">
                                    {errorMessage || 'An unexpected error occurred. Please try again.'}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    className="w-full"
                                    variant="destructive"
                                    onClick={() => setShowModal(false)}
                                >
                                    Try Again
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create a New Store</h1>
                    <p className="text-muted-foreground mt-2">
                        Set up a new tenant store. Your new store will have its own subdomain and database.
                    </p>
                </div>

                <div
                    className="rounded-xl border bg-card text-card-foreground shadow-lg p-6 relative overflow-hidden"
                    style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}
                >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: themes.gradients.primary }} />
                    <form className="flex flex-col gap-6" onSubmit={submitStore}>
                        <div className="grid gap-2">
                            <Label htmlFor="store_name">Store name</Label>
                            <Input
                                id="store_name"
                                value={data.store_name}
                                onChange={(e) => setData('store_name', e.target.value)}
                                placeholder="My Awesome Store"
                                autoComplete="organization"
                            />
                            <InputError message={errors.store_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subdomain">Subdomain</Label>
                            <div className="flex flex-wrap items-center gap-2">
                                <Input
                                    id="subdomain"
                                    className="max-w-[250px]"
                                    value={data.subdomain}
                                    onChange={(e) => setData('subdomain', e.target.value)}
                                    placeholder="mystore"
                                    autoComplete="off"
                                />
                                <span className="text-muted-foreground font-mono text-sm">.tenantly.software</span>
                            </div>
                            <InputError message={errors.subdomain} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="primary_color">Brand color</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="primary_color"
                                    type="color"
                                    className="h-10 w-20 cursor-pointer p-1"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                />
                                <span className="text-sm text-muted-foreground uppercase font-mono">{data.primary_color}</span>
                            </div>
                            <InputError message={errors.primary_color} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="banner_text">Welcome message (optional)</Label>
                            <Input
                                id="banner_text"
                                value={data.banner_text}
                                onChange={(e) => setData('banner_text', e.target.value)}
                                placeholder="e.g. Free shipping this week"
                            />
                            <InputError message={errors.banner_text} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo_url">Logo URL (optional)</Label>
                            <Input
                                id="logo_url"
                                value={data.logo_url}
                                onChange={(e) => setData('logo_url', e.target.value)}
                                placeholder="https://..."
                            />
                            <InputError message={errors.logo_url} />
                        </div>

                        {/* Subscription Plan Selection */}
                        <div className="grid gap-3 pt-2 border-t">
                            <Label className="text-base font-semibold">Select Subscription Plan</Label>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {plans.map((plan: any) => {
                                    const isSelected = data.plan_slug === plan.slug;
                                    const isPro = plan.slug === 'pro';
                                    const isCurrent = currentPlanSlug && plan.slug === currentPlanSlug;

                                    return (
                                        <div
                                            key={plan.id}
                                            onClick={() => setData('plan_slug', plan.slug)}
                                            className={`relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all duration-300 ${isSelected
                                                ? 'ring-2 shadow-md bg-primary/5 scale-[1.02]'
                                                : 'hover:border-primary/50 hover:bg-card/80'
                                                }`}
                                            style={{
                                                borderColor: isSelected
                                                    ? themes.colors.primary.DEFAULT
                                                    : themes.colors.glass?.border || 'rgba(255,255,255,0.1)',
                                            }}
                                        >
                                            {isCurrent && (
                                                <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm bg-emerald-600 dark:bg-emerald-500">
                                                    Current Plan
                                                </span>
                                            )}
                                            {isPro && (
                                                <span
                                                    className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-sm"
                                                    style={{ background: themes.gradients.primary }}
                                                >
                                                    Popular
                                                </span>
                                            )}
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm">{plan.name}</span>
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                        ${parseFloat(plan.price).toFixed(0)}/mo
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {plan.description}
                                                </p>
                                                {plan.features && plan.features.length > 0 && (
                                                    <ul className="mt-3 space-y-1.5 border-t pt-2.5">
                                                        {plan.features.map((feat: string, i: number) => (
                                                            <li key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                                                <Check className="w-3 h-3 text-primary shrink-0" style={{ color: themes.colors.primary.DEFAULT }} />
                                                                <span className="truncate">{feat}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-2 border-t flex items-center justify-between text-xs font-medium">
                                                <span className={isSelected ? 'text-primary font-bold' : 'text-muted-foreground'} style={isSelected ? { color: themes.colors.primary.DEFAULT } : {}}>
                                                    {isSelected ? 'Selected' : 'Select'}
                                                </span>
                                                <div
                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-primary' : 'border-muted-foreground/40'
                                                        }`}
                                                    style={isSelected ? { borderColor: themes.colors.primary.DEFAULT, background: themes.colors.primary.DEFAULT } : {}}
                                                >
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <InputError message={errors.plan_slug} />

                            {/* Plan Flexibility & Recommendations Block */}
                            <div className="mt-4 grid gap-3.5 rounded-xl border p-4 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/30" style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5" style={{ color: themes.colors.primary.DEFAULT }}>
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: themes.colors.primary.DEFAULT }}>
                                            Recommendations & Upgrading
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            For high-volume growth, we highly recommend upgrading to the <strong className="text-foreground">Pro Plan</strong> to unlock unlimited storage, priority platform support, and optimal transaction fees. You can seamlessly switch or upgrade plans anytime directly from your dashboard settings.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 border-t pt-3">
                                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0 mt-0.5">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                                            Hassle-Free Cancellation
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            Enjoy full transparency and absolute freedom. You can cancel your subscription at any moment. Your premium features will remain fully active until the end of your billing cycle, after which your store smoothly transitions to the Free tier without any loss of your essential store data.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto gap-2 transition-all hover:opacity-90 shadow-sm font-semibold"
                                style={{ background: themes.gradients.primary, color: themes.colors.text.primary }}
                            >
                                <Store className="w-4 h-4" />
                                {processing ? 'Creating...' : 'Create My Store'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
