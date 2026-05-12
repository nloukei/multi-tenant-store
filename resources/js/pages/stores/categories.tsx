import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Layers, Plus, Search, MoreVertical, Edit, Trash2, ChevronRight, ChevronDown, CornerDownRight, Loader2 } from 'lucide-react';

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
import { cn } from '@/lib/utils';

export default function StoreCategories({ tenant, categories }: { tenant: any, categories: any[] }) {
    const { flash } = usePage<any>().props;
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(() => [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manage Store', href: route('stores.edit', tenant.id) },
        { title: 'Categories', href: '#' },
    ], [tenant.id]);

    // Nest categories for hierarchical display
    const categoryTree = useMemo(() => {
        const map = new Map();
        const roots: any[] = [];
        
        categories.forEach(cat => {
            map.set(cat.id, { ...cat, children: [] });
        });
        
        categories.forEach(cat => {
            if (cat.parent_id && map.has(cat.parent_id)) {
                map.get(cat.parent_id).children.push(map.get(cat.id));
            } else {
                roots.push(map.get(cat.id));
            }
        });
        
        return roots;
    }, [categories]);

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        parent_id: '',
    });

    const handleAdd = () => {
        setEditingCategory(null);
        reset();
        clearErrors();
        setOpen(true);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id?.toString() || '',
        });
        clearErrors();
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            patch(route('stores.categories.update', [tenant.id, editingCategory.id]), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    setEditingCategory(null);
                    toast.success('Category updated successfully');
                },
                onError: (err) => {
                    toast.error(err.name || 'Failed to update category');
                }
            });
        } else {
            post(route('stores.categories.store', tenant.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    toast.success('Category created successfully');
                },
                onError: (err) => {
                    toast.error(err.name || 'Failed to create category');
                }
            });
        }
    };

    const confirmDelete = () => {
        if (deleteId) {
            destroy(route('stores.categories.destroy', [tenant.id, deleteId]), {
                onSuccess: () => {
                    setDeleteId(null);
                    toast.success('Category deleted successfully');
                },
                onError: () => toast.error('Failed to delete category'),
                onFinish: () => setDeleteId(null),
            });
        }

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
                
                <Sheet open={open} onOpenChange={setOpen}>
                    <Button onClick={handleAdd} className="rounded-full font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</SheetTitle>
                            <SheetDescription>
                                {editingCategory ? 'Modify your category details.' : 'Create a new category to organize your products.'}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="e.g. Laptops" />
                                <InputError message={errors.name} />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="parent_id">Parent Category (Optional)</Label>
                                <select 
                                    id="parent_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.parent_id}
                                    onChange={e => setData('parent_id', e.target.value)}
                                >
                                    <option value="">None (Top Level)</option>
                                    {categories
                                        .filter(c => !c.parent_id && c.id !== editingCategory?.id)
                                        .map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))
                                    }
                                </select>
                                <InputError message={errors.parent_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea 
                                    id="description" 
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    placeholder="Optional description of the category..."
                                />
                                <InputError message={errors.description} />
                            </div>

                            <SheetFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {processing ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <StoreManagementTabs tenantId={tenant.id} activeTab="categories" />


            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-muted-foreground border-b">
                        <tr>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category Hierarchy</th>
                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categoryTree.length > 0 ? (
                            categoryTree.map((category) => (
                                <CategoryRow 
                                    key={category.id} 
                                    category={category} 
                                    level={0}
                                    expandedIds={expandedIds}
                                    onToggle={toggleExpand}
                                    onEdit={handleEdit}
                                    onDelete={setDeleteId}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Layers className="h-10 w-10 text-neutral-200" />
                                        <p className="text-muted-foreground">No categories found for this store.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    ), [tenant, categories, categoryTree, open, data, processing, errors, expandedIds]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Categories - ${tenant.store_name}`} />
            
            {mainContent}

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete this category. Products linked to this category will become uncategorized.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={confirmDelete} variant="destructive">
                            Delete Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function CategoryRow({ category, level, expandedIds, onToggle, onEdit, onDelete }: any) {
    const isExpanded = expandedIds.includes(category.id);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <>
            <tr className={cn(
                "hover:bg-neutral-50 transition-colors group",
                level > 0 && "bg-neutral-50/30"
            )}>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
                        <div className="flex items-center gap-1 w-6 shrink-0">
                            {hasChildren ? (
                                <button 
                                    onClick={() => onToggle(category.id)}
                                    className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                >
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-neutral-500" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-neutral-500" />
                                    )}
                                </button>
                            ) : level > 0 ? (
                                <CornerDownRight className="h-4 w-4 text-neutral-300 ml-1" />
                            ) : null}
                        </div>
                        
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0 border shadow-sm">
                            <Layers className={cn(
                                "h-4 w-4",
                                level === 0 ? "text-blue-500" : "text-neutral-400"
                            )} />
                        </div>
                        <div>
                            <span className={cn(
                                "block transition-all",
                                level === 0 ? "font-bold text-neutral-900" : "font-medium text-neutral-700"
                            )}>
                                {category.name}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{category.description || 'No description'}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => onEdit(category)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(category.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </td>
            </tr>
            {hasChildren && isExpanded && (
                category.children.map((child: any) => (
                    <CategoryRow 
                        key={child.id} 
                        category={child} 
                        level={level + 1}
                        expandedIds={expandedIds}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))
            )}
        </>
    );
}
