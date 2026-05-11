import { TopBar } from '@/components/tenant/top-bar';
import { ProductCard } from '@/components/tenant/product-card';
import { Head, router } from '@inertiajs/react';
import { Package, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    image_url?: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Props {
    tenant: any;
    category: Category;
    products: Product[];
    currentSort: string;
}

export default function CategoryPage({ tenant, category, products, currentSort }: Props) {
    const accent = tenant.primary_color;

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('tenant.category.show', category.slug), { sort: e.target.value }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={`${category.name} - ${tenant.store_name || tenant.id}`} />
            <TopBar tenant={tenant} />

            {/* Category Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-8 py-12">
                    <h1 className="text-4xl font-black tracking-tight mb-2">{category.name}</h1>
                    {category.description && (
                        <p className="text-neutral-500 max-w-2xl">{category.description}</p>
                    )}
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-8 py-8 flex flex-col md:flex-row gap-8">
                
                {/* Main Content Area */}
                <div className="flex-1">
                    {/* Toolbar / Filters */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-neutral-200 mb-8 shadow-sm">
                        <p className="text-sm font-bold text-neutral-500">
                            Showing <span className="text-neutral-900">{products.length}</span> products
                        </p>
                        
                        {/* Sort Dropdown (Right side as requested) */}
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm font-bold text-neutral-600">Sort by:</span>
                            <div className="relative">
                                <select 
                                    value={currentSort}
                                    onChange={handleSortChange}
                                    className="appearance-none bg-neutral-50 border border-neutral-200 text-sm font-bold rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 transition-all cursor-pointer"
                                    style={{ '--tw-ring-color': accent } as any}
                                >
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price_asc">Price: Lowest to Highest</option>
                                    <option value="price_desc">Price: Highest to Lowest</option>
                                    <option value="name_asc">Name: A to Z</option>
                                    <option value="name_desc">Name: Z to A</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    currency={tenant.currency || 'USD'} 
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-white border border-neutral-200 rounded-xl">
                                <Package className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                                <p className="text-neutral-500 font-medium">No products found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
