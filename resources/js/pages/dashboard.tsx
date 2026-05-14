import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Store, ExternalLink, ShieldCheck, User, Settings, Clock } from 'lucide-react';
import { themes } from '@/themes';

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
    plan?: { name: string; slug: string; price: string };
    trial_ends_at?: string;
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
                            <Badge 
                                variant={isSuperAdmin ? 'default' : 'secondary'} 
                                className="px-3 py-1 flex gap-1 text-white shadow-sm"
                                style={isSuperAdmin ? { background: themes.gradients.primary } : { background: themes.colors.secondary.DEFAULT }}
                            >
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
                                <Card 
                                    key={tenant.id} 
                                    className="flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden group"
                                    style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}
                                >
                                    <div className="h-1 w-full transition-all duration-300 opacity-80 group-hover:opacity-100" style={{ background: themes.gradients.primary }} />
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2.5 rounded-xl text-white shadow-sm transition-transform group-hover:scale-105" style={{ background: themes.gradients.primary }}>
                                                    <Store className="h-5 w-5" />
                                                </div>
                                                {tenant.plan && (
                                                    <Badge variant="outline" className="text-xs font-semibold capitalize border-primary/20" style={{ color: themes.colors.primary.DEFAULT }}>
                                                        {tenant.plan.name} Plan
                                                    </Badge>
                                                )}
                                            </div>
                                            {isSuperAdmin && tenant.owner && (
                                                <div className="text-xs text-right text-muted-foreground">
                                                    Owner: <br />
                                                    <span className="font-medium text-foreground">{tenant.owner.name}</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardTitle className="mt-4 group-hover:text-primary transition-colors">{tenant.store_name || tenant.id}</CardTitle>
                                        <CardDescription className="truncate">
                                            {domain || 'No domain configured'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between gap-3">
                                        <div className="text-sm text-muted-foreground">
                                            Created {new Date(tenant.created_at).toLocaleDateString()}
                                        </div>
                                        {(() => {
                                            if (!tenant.trial_ends_at) return null;
                                            const diffMs = new Date(tenant.trial_ends_at).getTime() - Date.now();
                                            const trialDaysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                            const isTrialActive = trialDaysLeft > 0;

                                            return (
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                                    isTrialActive 
                                                        ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400' 
                                                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                                                }`}>
                                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                                    <span>
                                                        {isTrialActive 
                                                            ? `Trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}` 
                                                            : 'Trial expired'}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                    <CardFooter className="pt-4 border-t">
                                        <div className="flex gap-2 w-full">
                                            <Button asChild variant="outline" className="flex-1 gap-2">
                                                <Link href={route('stores.edit', tenant.id)}>
                                                    Manage <Settings className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                asChild 
                                                className="flex-1 gap-2 transition-all hover:opacity-90 shadow-sm" 
                                                disabled={!domain}
                                                style={domain ? { background: themes.gradients.primary, color: themes.colors.text.primary } : {}}
                                            >
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
                    <div 
                        className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-neutral-50/50 dark:bg-neutral-900/20 border-dashed transition-all"
                        style={{ borderColor: themes.colors.glass?.border || 'rgba(255,255,255,0.1)' }}
                    >
                        <div className="p-4 rounded-full mb-4" style={{ background: `${themes.colors.primary.DEFAULT}1A`, color: themes.colors.primary.DEFAULT }}>
                            <Store className="h-8 w-8" />
                        </div>
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
