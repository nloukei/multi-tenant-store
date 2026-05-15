import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StoreManagementTabs } from '@/components/store-management-tabs';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Store, CheckCircle2, AlertCircle, Save, ArrowLeft, Image as ImageIcon, Trash2, Plus, Palette, Globe, Type, Upload, X, Eye, EyeOff, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { themes } from '@/themes';


export default function EditStore({ tenant }: { tenant: any }) {
    const { flash } = usePage<any>().props;
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [bannerView, setBannerView] = useState<'grid' | 'list'>('grid');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        store_name: tenant.store_name || '',
        primary_color: tenant.primary_color || '#1d4ed8',
        banner_text: tenant.banner_text || '',
        logo_url: tenant.logo_url || '',
        logo_file: null as File | null,
        banner_images: [] as File[],
        delete_banners: [] as number[],
        currency: tenant.currency || 'USD',
    });

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Store', href: '#' },
    ], []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('banner_images', [...data.banner_images, ...files]);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...newPreviews]);
    };

    const toggleDeleteExisting = (index: number) => {
        if (data.delete_banners.includes(index)) {
            setData('delete_banners', data.delete_banners.filter(i => i !== index));
        } else {
            setData('delete_banners', [...data.delete_banners, index]);
        }
    };

    const removeNewUpload = (index: number) => {
        const newFiles = [...data.banner_images];
        newFiles.splice(index, 1);
        setData('banner_images', newFiles);

        const newPreviews = [...previewUrls];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviewUrls(newPreviews);
    };

    const submitUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stores.update', tenant.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setPreviewUrls([]);
                setData('banner_images', []);
                setData('delete_banners', []);
            }
        });
    };

    const existingBanners = tenant.banners || [];
    const totalBanners = existingBanners.length + previewUrls.length;

    const mainContent = useMemo(() => (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
                    <p className="text-muted-foreground mt-1">
                        {tenant.store_name} ({tenant.id})
                    </p>
                </div>
            </div>

            <StoreManagementTabs 
                tenantId={tenant.id} 
                activeTab="settings" 
                domain={tenant.domains?.[0]?.domain} 
            />

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

            {/* ── Subscription Plan Card Overview ── */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden relative" style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ background: themes.gradients.primary }} />
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Store Plan</span>
                            {tenant.cancel_at_period_end && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Cancels Next Month
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                            <h2 className="text-2xl font-black text-foreground">
                                {tenant.plan?.name || 'Free'} Plan
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10" style={{ color: themes.colors.primary.DEFAULT }}>
                                ${parseFloat(tenant.plan?.price || '0').toFixed(0)} / mo
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {tenant.cancel_at_period_end
                                ? 'Your subscription benefits remain active until the end of your billing cycle.'
                                : 'Unlock more capabilities, unlimited storage, and priority support by upgrading tiers.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link href={route('stores.plan', tenant.id)}>
                            <Button type="button" className="gap-2 text-xs font-semibold h-9 shadow-sm" style={{ background: themes.gradients.primary, color: themes.colors.text.primary }}>
                                <Sparkles className="w-3.5 h-3.5" />
                                Upgrade / Change Plan
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <form className="flex flex-col gap-8" onSubmit={submitUpdate}>

                {/* ── Section 1: Store Identity ── */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="border-b bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                                <Store className="h-4 w-4 text-neutral-500" />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm">Store Identity</h2>
                                <p className="text-xs text-muted-foreground">Name, logo, and visual brand</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid gap-6">
                        {/* Store Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="store_name">Store name</Label>
                            <Input
                                id="store_name"
                                value={data.store_name}
                                onChange={(e) => setData('store_name', e.target.value)}
                            />
                            <InputError message={errors.store_name} />
                        </div>

                        {/* Logo + Brand Color Row */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Logo */}
                            <div className="grid gap-2">
                                <Label htmlFor="logo_file">Store Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0">
                                        {data.logo_url ? (
                                            <img src={data.logo_url} alt="Logo" className="h-full w-full object-contain p-1" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-neutral-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            id="logo_file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('logo_file', e.target.files?.[0] || null)}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">PNG or SVG with transparent background</p>
                                    </div>
                                </div>
                                <InputError message={errors.logo_file} />
                            </div>

                            {/* Brand Color */}
                            <div className="grid gap-2">
                                <Label htmlFor="primary_color">Brand color</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="primary_color"
                                        type="color"
                                        className="h-10 w-14 cursor-pointer rounded-lg border-2 border-neutral-200 p-1 transition-all hover:border-neutral-300"
                                        value={data.primary_color}
                                        onChange={(e) => setData('primary_color', e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 flex-1">
                                        <Input
                                            value={data.primary_color}
                                            onChange={(e) => setData('primary_color', e.target.value)}
                                            className="font-mono uppercase text-sm"
                                            maxLength={7}
                                        />
                                        <div
                                            className="h-10 w-10 rounded-lg border shadow-inner shrink-0"
                                            style={{ backgroundColor: data.primary_color }}
                                        />
                                    </div>
                                </div>
                                <InputError message={errors.primary_color} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Storefront Config ── */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="border-b bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                                <Globe className="h-4 w-4 text-neutral-500" />
                            </div>
                            <div>
                                <h2 className="font-bold text-sm">Storefront Configuration</h2>
                                <p className="text-xs text-muted-foreground">Currency, messaging, and display preferences</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Currency */}
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Store Currency</Label>
                            <select
                                id="currency"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="PHP">PHP - Philippine Peso</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                            </select>
                            <InputError message={errors.currency} />
                        </div>

                        {/* Welcome Message */}
                        <div className="grid gap-2">
                            <Label htmlFor="banner_text">Welcome message</Label>
                            <Input
                                id="banner_text"
                                value={data.banner_text}
                                onChange={(e) => setData('banner_text', e.target.value)}
                                placeholder="e.g. 50% OFF ALL ITEMS"
                            />
                            <InputError message={errors.banner_text} />
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Banner Carousel ── */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="border-b bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-neutral-500" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-sm">Banner Carousel</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {totalBanners} image{totalBanners !== 1 ? 's' : ''} uploaded
                                        {data.delete_banners.length > 0 && (
                                            <span className="text-red-500 ml-1">
                                                ({data.delete_banners.length} marked for deletion)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {totalBanners > 2 && (
                                    <div className="flex rounded-lg border overflow-hidden">
                                        <button
                                            type="button"
                                            className={`px-3 py-1.5 text-xs font-bold transition-colors ${bannerView === 'grid' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
                                            onClick={() => setBannerView('grid')}
                                        >
                                            Grid
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-3 py-1.5 text-xs font-bold transition-colors ${bannerView === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 hover:bg-neutral-50'}`}
                                            onClick={() => setBannerView('list')}
                                        >
                                            List
                                        </button>
                                    </div>
                                )}
                                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => document.getElementById('banner_images')?.click()}>
                                    <Plus className="h-4 w-4" /> Add Images
                                </Button>
                                <input
                                    id="banner_images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {totalBanners > 0 ? (
                            <div className={
                                bannerView === 'grid' && totalBanners > 2
                                    ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                                    : 'grid grid-cols-1 gap-4'
                            }>
                                {/* Existing Banners */}
                                {existingBanners.map((banner: any, index: number) => {
                                    const isMarkedForDeletion = data.delete_banners.includes(index);
                                    return (
                                        <div
                                            key={index}
                                            className={`group relative overflow-hidden rounded-xl border-2 transition-all ${isMarkedForDeletion
                                                    ? 'border-red-300 opacity-60 grayscale'
                                                    : 'border-neutral-200 hover:border-neutral-300'
                                                } ${bannerView === 'grid' && totalBanners > 2 ? 'aspect-video' : 'aspect-[1800/558]'}`}
                                        >
                                            <img src={banner.url} className="h-full w-full object-cover" alt={`Banner ${index + 1}`} />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                            {/* Banner Index Badge */}
                                            <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 text-[10px] font-bold rounded-md backdrop-blur-sm">
                                                #{index + 1}
                                            </div>

                                            {/* Delete / Restore Button */}
                                            <button
                                                type="button"
                                                className={`absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${isMarkedForDeletion
                                                        ? 'bg-white text-neutral-700 hover:bg-neutral-100'
                                                        : 'bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100'
                                                    }`}
                                                onClick={() => toggleDeleteExisting(index)}
                                                title={isMarkedForDeletion ? 'Restore' : 'Delete'}
                                            >
                                                {isMarkedForDeletion ? <EyeOff className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                            </button>

                                            {/* Deletion Overlay */}
                                            {isMarkedForDeletion && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                        Will be removed on save
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* New Upload Previews */}
                                {previewUrls.map((url, index) => (
                                    <div
                                        key={`new-${index}`}
                                        className={`group relative overflow-hidden rounded-xl border-2 border-green-300 bg-green-50 ${bannerView === 'grid' && totalBanners > 2 ? 'aspect-video' : 'aspect-[1800/558]'
                                            }`}
                                    >
                                        <img src={url} className="h-full w-full object-cover" alt="New Preview" />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* New Badge */}
                                        <div className="absolute top-3 left-3 bg-green-500 text-white px-2.5 py-1 text-[10px] font-bold rounded-md">
                                            NEW
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            className="absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            onClick={() => removeNewUpload(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-neutral-50/50 hover:bg-neutral-50 cursor-pointer transition-colors"
                                onClick={() => document.getElementById('banner_images')?.click()}
                            >
                                <div className="h-16 w-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                                    <Upload className="h-8 w-8 text-neutral-300" />
                                </div>
                                <p className="text-sm font-bold text-neutral-500">Click to upload banner images</p>
                                <p className="text-xs text-muted-foreground mt-1">Recommended: 1800 × 558px, JPG or PNG</p>
                            </div>
                        )}
                        <InputError message={errors.banner_images} />
                    </div>
                </div>

                {/* ── Action Bar ── */}
                <div className="flex justify-between gap-4 sticky bottom-0 bg-background/80 backdrop-blur-sm border-t -mx-6 px-6 py-4 z-10">
                    <Button variant="outline" type="button" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" disabled={processing} className="gap-2 px-8">
                        <Save className="w-4 h-4" />
                        {processing ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    ), [tenant, data, processing, errors, previewUrls, bannerView, flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${tenant.store_name}`} />
            {mainContent}
        </AppLayout>
    );
}
