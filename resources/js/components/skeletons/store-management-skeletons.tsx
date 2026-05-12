import { Skeleton } from '@/components/skeletons/skeleton';

/**
 * Skeleton for the Store Settings (edit) page content.
 */
export function StoreSettingsSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-10 w-32 self-end" />
        </div>
    );
}

/**
 * Skeleton for the Store Products page content.
 */
export function StoreProductsSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Search */}
            <Skeleton className="h-11 w-full rounded-xl" />

            {/* Table */}
            <div className="rounded-xl border overflow-hidden w-full">
                <div className="bg-neutral-50 px-6 py-4 border-b flex gap-8">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="ml-auto h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4 border-b last:border-0">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="ml-auto h-4 w-16" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Skeleton for the Store Categories page content.
 */
export function StoreCategoriesSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Table */}
            <div className="rounded-xl border overflow-hidden w-full">
                <div className="bg-neutral-50 px-6 py-4 border-b flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-3 border-b last:border-0" style={{ paddingLeft: i % 2 === 1 ? '3.5rem' : '1.5rem' }}>
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-32' : 'w-24'}`} />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Skeleton for the Store Promos page content.
 */
export function StorePromosSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Table */}
            <div className="rounded-xl border overflow-hidden w-full">
                <div className="bg-neutral-50 px-6 py-4 border-b flex gap-8">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="ml-auto h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4 border-b last:border-0">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="ml-auto h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
