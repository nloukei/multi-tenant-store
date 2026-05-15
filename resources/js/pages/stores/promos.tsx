import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Tag, Plus, Edit, Trash2, Loader2, Percent, DollarSign, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StoreManagementTabs } from '@/components/store-management-tabs';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useState, useMemo } from 'react';
import { toast } from '@/components/ui/toast';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function StorePromos({ tenant, promos }: { tenant: any, promos: any[] }) {
    const { flash } = usePage<any>().props;
    const [open, setOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Store', href: route('stores.edit', tenant.id) },
        { title: 'Promos', href: '#' },
    ], [tenant.id]);

    const filteredPromos = useMemo(() => {
        return promos.filter(promo => 
            promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promo.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [promos, searchQuery]);

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '',
        description: '',
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
        image: null as File | null,
    });

    const handleAdd = () => {
        setEditingPromo(null);
        reset();
        clearErrors();
        setOpen(true);
    };

    const handleEdit = (promo: any) => {
        setEditingPromo(promo);
        setData({
            title: promo.title,
            description: promo.description || '',
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value?.toString() || '',
            min_purchase: promo.min_purchase?.toString() || '',
            starts_at: promo.starts_at ? promo.starts_at.split('T')[0] : '',
            ends_at: promo.ends_at ? promo.ends_at.split('T')[0] : '',
            is_active: promo.is_active,
            image: null,
        });
        clearErrors();
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPromo) {
            post(route('stores.promos.update', [tenant.id, editingPromo.id]), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setEditingPromo(null);
                    toast.success('Promo updated successfully');
                },
                onError: (err: any) => {
                    toast.error(err.title || 'Failed to update promo');
                },
                forceFormData: true,
            });
        } else {
            post(route('stores.promos.store', tenant.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    toast.success('Promo created successfully');
                },
                onError: (err: any) => {
                    toast.error(err.title || 'Failed to create promo');
                },
            });
        }
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('stores.promos.destroy', [tenant.id, deleteId]), {
                onSuccess: () => {
                    setDeleteId(null);
                    toast.success('Promo deleted successfully');
                },
                onError: () => toast.error('Failed to delete promo'),
                onFinish: () => setDeleteId(null),
            });
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusBadge = (promo: any) => {
        const now = new Date();
        const start = promo.starts_at ? new Date(promo.starts_at) : null;
        const end = promo.ends_at ? new Date(promo.ends_at) : null;

        if (!promo.is_active) {
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-500 whitespace-nowrap">Inactive</span>;
        }
        if (end && now > end) {
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 whitespace-nowrap">Expired</span>;
        }
        if (start && now < start) {
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 whitespace-nowrap">Scheduled</span>;
        }
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">Active</span>;
    };

    const mainContent = useMemo(() => (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
                    <p className="text-muted-foreground mt-1">
                        {tenant.store_name} ({tenant.id})
                    </p>
                </div>

                {/* Add Promo Sheet */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={handleAdd} className="rounded-full font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Promo
                    </Button>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingPromo ? 'Edit Promo' : 'Create New Promo'}</SheetTitle>
                            <SheetDescription>
                                {editingPromo ? 'Modify the details of your promo.' : 'Set up a new promotional offer for your store.'}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Summer Sale" />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Promo Code *</Label>
                                <Input id="code" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} required placeholder="e.g. SUMMER20" className="font-mono uppercase" />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe the promo offer..."
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="discount_type">Discount Type *</Label>
                                    <select
                                        id="discount_type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.discount_type}
                                        onChange={e => setData('discount_type', e.target.value)}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                    <InputError message={errors.discount_type} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discount_value">Discount Value *</Label>
                                    <Input id="discount_value" type="number" step="0.01" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)} required placeholder={data.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 10.00'} />
                                    <InputError message={errors.discount_value} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="min_purchase">Minimum Purchase</Label>
                                <Input id="min_purchase" type="number" step="0.01" value={data.min_purchase} onChange={e => setData('min_purchase', e.target.value)} placeholder="Optional" />
                                <InputError message={errors.min_purchase} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="starts_at">Start Date</Label>
                                    <Input id="starts_at" type="date" value={data.starts_at} onChange={e => setData('starts_at', e.target.value)} />
                                    <InputError message={errors.starts_at} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ends_at">End Date</Label>
                                    <Input id="ends_at" type="date" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)} />
                                    <InputError message={errors.ends_at} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-300"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Promo Banner Image</Label>
                                <Input id="image" type="file" accept="image/*" onChange={e => setData('image', e.target.files?.[0] || null)} />
                                <InputError message={errors.image} />
                            </div>
                            <SheetFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {processing ? 'Saving...' : editingPromo ? 'Update Promo' : 'Create Promo'}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <StoreManagementTabs 
                tenantId={tenant.id} 
                activeTab="promos" 
                domain={tenant.domains?.[0]?.domain} 
            />

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search promos..."
                    className="pl-10 h-11 rounded-xl bg-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Promo List */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Promo</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Discount</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Duration</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredPromos.length > 0 ? (
                            filteredPromos.map((promo) => (
                                <tr key={promo.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                                                {promo.image_url ? (
                                                    <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Tag className="h-5 w-5 text-neutral-400" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold text-foreground block">{promo.title}</span>
                                                <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{promo.code}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 font-bold">
                                            {promo.discount_type === 'percentage' ? (
                                                <><span>{promo.discount_value}%</span><Percent className="h-3.5 w-3.5 text-neutral-400" /></>
                                            ) : (
                                                <><DollarSign className="h-3.5 w-3.5 text-neutral-400" /><span>{promo.discount_value}</span></>
                                            )}
                                        </div>
                                        {promo.min_purchase && (
                                            <span className="text-[10px] text-muted-foreground">Min. ${promo.min_purchase}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-xs text-neutral-600">
                                            <div className="flex items-center justify-center gap-1">
                                                <Calendar className="h-3 w-3 text-neutral-400" />
                                                {formatDate(promo.starts_at)} — {formatDate(promo.ends_at)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(promo)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => handleEdit(promo)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteId(promo.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Tag className="h-10 w-10 text-muted" />
                                        <p className="text-muted-foreground">No promos found for this store.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    ), [tenant, filteredPromos, open, data, processing, errors, searchQuery]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Promos - ${tenant.store_name}`} />
            {mainContent}

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this promo. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={confirmDelete} variant="destructive">
                            Delete Promo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
