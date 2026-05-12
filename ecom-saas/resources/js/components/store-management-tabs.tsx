import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
    StoreSettingsSkeleton,
    StoreProductsSkeleton,
    StoreCategoriesSkeleton,
    StorePromosSkeleton,
} from '@/components/skeletons/store-management-skeletons';

interface StoreManagementTabsProps {
    tenantId: string;
    activeTab: 'settings' | 'products' | 'categories' | 'promos' | 'orders';
}

const skeletonMap = {
    settings: <StoreSettingsSkeleton />,
    products: <StoreProductsSkeleton />,
    categories: <StoreCategoriesSkeleton />,
    promos: <StorePromosSkeleton />,
    orders: <StoreProductsSkeleton />, // Reusing products skeleton as a placeholder
};

export function StoreManagementTabs({ tenantId, activeTab }: StoreManagementTabsProps) {
    const [navigatingTo, setNavigatingTo] = useState<'settings' | 'products' | 'categories' | 'promos' | 'orders' | null>(null);

    const tabs = [
        { id: 'settings' as const, label: 'Settings', href: route('stores.edit', tenantId) },
        { id: 'products' as const, label: 'Products', href: route('stores.products', tenantId) },
        { id: 'categories' as const, label: 'Categories', href: route('stores.categories', tenantId) },
        { id: 'promos' as const, label: 'Promos', href: route('stores.promos', tenantId) },
        { id: 'orders' as const, label: 'Orders', href: route('stores.orders', tenantId) },
    ];

    useEffect(() => {
        // When Inertia finishes navigation, clear the skeleton
        const removeFinish = router.on('finish', () => {
            setNavigatingTo(null);
        });

        return () => {
            removeFinish();
        };
    }, []);

    const handleTabClick = (tabId: 'settings' | 'products' | 'categories' | 'promos' | 'orders', href: string) => {
        if (tabId === activeTab) return; // already here, don't navigate
        setNavigatingTo(tabId);
        router.visit(href, {
            preserveState: true,
            preserveScroll: true,
            only: ['products', 'categories', 'promos', 'tenant'],
        });
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-6 border-b -mt-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id, tab.href)}
                        className={cn(
                            "pb-3 text-sm transition-colors border-b-2 cursor-pointer",
                            activeTab === tab.id
                                ? "border-black text-black font-bold"
                                : "border-transparent text-muted-foreground hover:text-black font-medium"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Instantly render skeleton while Inertia fetches the next page */}
            {navigatingTo && (
                <div className="absolute left-0 right-0 top-full mt-6 bg-white z-[60] min-h-screen pb-20">
                    {skeletonMap[navigatingTo]}
                </div>
            )}
        </div>
    );

}
