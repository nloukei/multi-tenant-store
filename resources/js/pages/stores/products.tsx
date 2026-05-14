import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Package, Plus, Search, MoreVertical, Edit, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StoreManagementTabs } from '@/components/store-management-tabs';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
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

export default function StoreProducts({ tenant, products, categories }: { tenant: any, products: any[], categories: any[] }) {
    const { flash } = usePage<any>().props;
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Store', href: route('stores.edit', tenant.id) },
        { title: 'Products', href: '#' },
    ], [tenant.id]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (product.category?.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [products, searchQuery]);

    const { data, setData, post, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        price: '',
        compare_at_price: '',
        stock: '0',
        sku: '',
        category_id: '',
        image: null as File | null,
    });

    const handleAdd = () => {
        setEditingProduct(null);
        reset();
        clearErrors();
        setOpen(true);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            compare_at_price: product.compare_at_price?.toString() || '',
            stock: product.stock.toString(),
            sku: product.sku || '',
            category_id: product.category_id?.toString() || '',
            image: null,
        });
        clearErrors();
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingProduct) {
            // For file uploads in Inertia, we often use POST with _method: 'patch'
            // because standard PATCH requests don't support multipart/form-data well
            post(route('stores.products.update', [tenant.id, editingProduct.id]), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setEditingProduct(null);
                    toast.success('Product updated successfully');
                },
                onError: (err: any) => {
                    toast.error(err.name || 'Failed to update product');
                },
                forceFormData: true,
            });
        } else {
            post(route('stores.products.store', tenant.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    toast.success('Product added successfully');
                },
                onError: (err: any) => {
                    toast.error(err.name || 'Failed to add product');
                }
            });
        }
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('stores.products.destroy', [tenant.id, deleteId]), {
                onSuccess: () => {
                    setDeleteId(null);
                    toast.success('Product deleted successfully');
                },
                onError: () => toast.error('Failed to delete product'),
                onFinish: () => setDeleteId(null),
            });
        }
    };

    const formatCurrency = (amount: number | string) => {
        const currency = tenant.currency || 'USD';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(Number(amount));
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
                
                {/* Add Product Sheet */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={handleAdd} className="rounded-full font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</SheetTitle>
                            <SheetDescription>
                                {editingProduct ? 'Modify the details of your product.' : 'Fill in the details to add a new product to your store.'}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Category</Label>
                                <select 
                                    id="category_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.category_id}
                                    onChange={e => setData('category_id', e.target.value)}
                                >
                                    <option value="">No Category</option>
                                    {categories?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea 
                                    id="description" 
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price *</Label>
                                    <Input id="price" type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} required />
                                    <InputError message={errors.price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="compare_at_price">Compare at Price</Label>
                                    <Input id="compare_at_price" type="number" step="0.01" value={data.compare_at_price} onChange={e => setData('compare_at_price', e.target.value)} placeholder="Optional" />
                                    <InputError message={errors.compare_at_price} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock *</Label>
                                    <Input id="stock" type="number" value={data.stock} onChange={e => setData('stock', e.target.value)} required />
                                    <InputError message={errors.stock} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" value={data.sku} onChange={e => setData('sku', e.target.value)} placeholder="Optional" />
                                    <InputError message={errors.sku} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Product Image</Label>
                                <Input id="image" type="file" accept="image/*" onChange={e => setData('image', e.target.files?.[0] || null)} />
                                <InputError message={errors.image} />
                            </div>
                            <SheetFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {processing ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <StoreManagementTabs tenantId={tenant.id} activeTab="products" />

            {/* Search and Filters */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    className="pl-10 h-11 rounded-xl bg-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Product List */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Price</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Stock</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-muted/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-neutral-400" />
                                                )}
                                            </div>
                                            <div>
                                                <span className="font-bold text-foreground block">{product.name}</span>
                                                <span className="text-xs text-muted-foreground flex gap-2">
                                                    <span>SKU: {product.sku || 'N/A'}</span>
                                                    {product.category && (
                                                        <>
                                                            <span className="text-neutral-300">•</span>
                                                            <span className="text-primary/70 font-medium">{product.category.name}</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-mono font-medium">{formatCurrency(product.price)}</div>
                                        {product.compare_at_price && (
                                            <div className="text-xs text-muted-foreground line-through">{formatCurrency(product.compare_at_price)}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {product.stock} in stock
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteId(product.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package className="h-10 w-10 text-muted" />
                                        <p className="text-muted-foreground">No products found for this store.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    ), [tenant, filteredProducts, open, data, processing, errors, searchQuery]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Products - ${tenant.store_name}`} />
            
            {mainContent}

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this product. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={confirmDelete} variant="destructive">
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

