import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StoreManagementTabs } from '@/components/store-management-tabs';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Store, CheckCircle2, AlertCircle, Save, ArrowLeft, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

export default function EditStore({ tenant }: { tenant: any }) {
    const { flash } = usePage<any>().props;
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Store', href: '#' },
    ];

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${tenant.store_name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
                        <p className="text-muted-foreground mt-1">
                            {tenant.store_name} ({tenant.id})
                        </p>
                    </div>
                </div>

                <StoreManagementTabs tenantId={tenant.id} activeTab="settings" />

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

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <form className="flex flex-col gap-8" onSubmit={submitUpdate}>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="store_name">Store name</Label>
                                <Input
                                    id="store_name"
                                    value={data.store_name}
                                    onChange={(e) => setData('store_name', e.target.value)}
                                />
                                <InputError message={errors.store_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="logo_file">Store Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg border bg-neutral-50 flex items-center justify-center shrink-0">
                                        {data.logo_url ? (
                                            <img src={data.logo_url} alt="Logo" className="h-full w-full object-contain" />
                                        ) : (
                                            <span className="text-[10px] text-neutral-400">No Logo</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            id="logo_file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('logo_file', e.target.files?.[0] || null)}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">Recommended: PNG or SVG with transparent background.</p>
                                    </div>
                                </div>
                                <InputError message={errors.logo_file} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="primary_color">Brand color</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="primary_color"
                                        type="color"
                                        className="h-10 w-20 cursor-pointer rounded-md border p-1"
                                        value={data.primary_color}
                                        onChange={(e) => setData('primary_color', e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground uppercase font-mono">{data.primary_color}</span>
                                </div>
                                <InputError message={errors.primary_color} />
                            </div>

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

                            <div className="grid gap-2">
                                <Label htmlFor="banner_text">Welcome message (Global)</Label>
                                <Input
                                    id="banner_text"
                                    value={data.banner_text}
                                    onChange={(e) => setData('banner_text', e.target.value)}
                                    placeholder="e.g. 50% OFF ALL ITEMS"
                                />
                                <InputError message={errors.banner_text} />
                            </div>
                        </div>

                        {/* Banner Carousel Management */}
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-lg font-semibold">Banner Carousel</Label>
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

                            {/* Existing Banners */}
                            <div className="grid grid-cols-1 gap-4">
                                {(tenant.banners || []).map((banner: any, index: number) => (
                                    <div key={index} className={`relative aspect-[1800/558] overflow-hidden rounded-lg border transition-all ${data.delete_banners.includes(index) ? 'opacity-30 grayscale' : ''}`}>
                                        <img src={banner.url} className="h-full w-full object-cover" alt={`Banner ${index}`} />
                                        <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-colors" />
                                        <Button
                                            type="button"
                                            variant={data.delete_banners.includes(index) ? "default" : "destructive"}
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => toggleDeleteExisting(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {data.delete_banners.includes(index) && (
                                            <div className="absolute inset-0 flex items-center justify-center font-bold text-white bg-black/40">
                                                To be deleted
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* New Upload Previews */}
                                {previewUrls.map((url, index) => (
                                    <div key={`new-${index}`} className="relative aspect-[1800/558] overflow-hidden rounded-lg border border-primary/50 bg-primary/5">
                                        <img src={url} className="h-full w-full object-cover" alt="New Preview" />
                                        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 text-xs rounded">New</div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={() => removeNewUpload(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {(tenant.banners?.length === 0 && data.banner_images.length === 0) && (
                                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-neutral-50">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20 mb-2" />
                                    <p className="text-sm text-muted-foreground">No banner images uploaded yet.</p>
                                </div>
                            )}
                            <InputError message={errors.banner_images} />
                        </div>

                        <div className="pt-4 flex justify-between gap-4">
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
            </div>
        </AppLayout>
    );
}
