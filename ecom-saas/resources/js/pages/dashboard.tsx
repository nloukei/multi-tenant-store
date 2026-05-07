import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Store, ExternalLink, ShieldCheck, User, Settings } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Tenant {
    id: string;
    store_name: string;
    domains: { domain: string }[];
    owner?: { name: string; email: string };
    created_at: string;
}

export default function Dashboard({ tenants }: { tenants: Tenant[] }) {
    const { auth } = usePage<any>().props;
    const isSuperAdmin = auth.user.role === 'super_admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Section */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isSuperAdmin ? 'Manage All Stores' : 'Your Stores'}
                            </h1>
                            <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className="px-3 py-1 flex gap-1">
                                {isSuperAdmin ? (
                                    <>
                                        <ShieldCheck className="h-3 w-3" /> Super Admin
                                    </>
                                ) : (
                                    <>
                                        <User className="h-3 w-3" /> Store Admin
                                    </>
                                )}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2">
                            {isSuperAdmin 
                                ? 'Overview of all tenant stores across the platform.' 
                                : 'Manage the stores you own and operate.'}
                        </p>
                    </div>
                </div>

                {/* Tenants Grid */}
                {tenants.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tenants.map((tenant) => {
                            // Format the URL
                            const domain = tenant.domains?.[0]?.domain;
                            const protocol = window.location.protocol;
                            const storeUrl = domain ? `${protocol}//${domain}${window.location.port ? ':' + window.location.port : ''}` : '#';

                            return (
                                <Card key={tenant.id} className="flex flex-col hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Store className="h-6 w-6" />
                                            </div>
                                            {isSuperAdmin && tenant.owner && (
                                                <div className="text-xs text-right text-muted-foreground">
                                                    Owner: <br />
                                                    <span className="font-medium text-foreground">{tenant.owner.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="mt-4">{tenant.store_name || tenant.id}</CardTitle>
                                        <CardDescription className="truncate">
                                            {domain || 'No domain configured'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="text-sm text-muted-foreground">
                                            Created {new Date(tenant.created_at).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t">
                                        <div className="flex gap-2 w-full">
                                            <Button asChild variant="outline" className="flex-1 gap-2">
                                                <Link href={route('stores.edit', tenant.id)}>
                                                    Manage <Settings className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button asChild className="flex-1 gap-2" disabled={!domain}>
                                                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                                                    Visit <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/20 border-dashed">
                        <Store className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No stores found</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            {isSuperAdmin 
                                ? "There are no stores in the system yet." 
                                : "You haven't created any stores yet."}
                        </p>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
