import { Head, Link, usePage } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    price: string;
}

interface TenantProps {
    id: string;
    store_name?: string | null;
    primary_color: string;
    logo_url?: string | null;
    banner_text?: string | null;
    trial_ends_at?: string | null;
}

interface Props {
    tenant: TenantProps;
    products: Product[];
}

export default function Storefront({ tenant, products }: Props) {
    const { tenant_auth } = usePage<any>().props;
    const title = tenant.store_name || tenant.id;
    const accent = tenant.primary_color || '#e46868ff';

    return (
        <div className="min-h-screen bg-[#fafafa] text-[#171717]">
            <Head title={title} />
            <header
                className="border-b border-black/10 px-8 py-6"
                style={{ borderBottomColor: `${accent}33` }}
            >
                <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        {tenant.logo_url ? (
                            <img
                                src={tenant.logo_url}
                                alt=""
                                className="h-12 w-auto max-w-[200px] object-contain"
                            />
                        ) : null}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
                                {title}
                            </h1>
                            {tenant.banner_text ? (
                                <p className="mt-1 text-sm text-neutral-600">{tenant.banner_text}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {tenant.trial_ends_at ? (
                            <p className="hidden text-xs text-neutral-500 md:block">
                                Trial ends {new Date(tenant.trial_ends_at).toLocaleDateString()}
                            </p>
                        ) : null}

                        <div className="flex items-center gap-3 border-l border-black/10 pl-6">
                            {tenant_auth ? (
                                <>
                                    <span className="text-sm font-medium text-neutral-600">
                                        Hi, {tenant_auth.name.split(' ')[0]}
                                    </span>
                                    <Link
                                        href={route('tenant.logout')}
                                        method="post"
                                        as="button"
                                        className="text-sm font-semibold text-neutral-900 transition hover:opacity-70"
                                    >
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('tenant.login')}
                                        className="text-sm font-semibold text-neutral-900 transition hover:opacity-70"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('tenant.register')}
                                        className="rounded-full px-5 py-2 text-sm font-bold text-white transition hover:opacity-90"
                                        style={{ backgroundColor: accent }}
                                    >
                                        Join Store
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl p-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className="rounded-lg border border-black/10 bg-white p-4 shadow-sm"
                            >
                                <h2 className="font-semibold">{product.name}</h2>
                                <p className="text-neutral-600">${product.price}</p>
                                <button
                                    type="button"
                                    className="mt-3 w-full rounded-md px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                    style={{ backgroundColor: accent }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-neutral-600">No products available in this store yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
