import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Store, CheckCircle2, AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Create Store',
        href: '/stores/create',
    },
];

export default function CreateStore() {
    const { flash } = usePage<any>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: '',
        subdomain: '',
        primary_color: '#1d4ed8',
        banner_text: '',
        logo_url: '',
    });

    const submitStore = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('stores.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Store" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create a New Store</h1>
                    <p className="text-muted-foreground mt-2">
                        Set up a new tenant store. Your new store will have its own subdomain and database.
                    </p>
                </div>

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
                    <form className="flex flex-col gap-6" onSubmit={submitStore}>
                        <div className="grid gap-2">
                            <Label htmlFor="store_name">Store name</Label>
                            <Input
                                id="store_name"
                                value={data.store_name}
                                onChange={(e) => setData('store_name', e.target.value)}
                                placeholder="My Awesome Store"
                                autoComplete="organization"
                            />
                            <InputError message={errors.store_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="subdomain">Subdomain</Label>
                            <div className="flex flex-wrap items-center gap-2">
                                <Input
                                    id="subdomain"
                                    className="max-w-[250px]"
                                    value={data.subdomain}
                                    onChange={(e) => setData('subdomain', e.target.value)}
                                    placeholder="mystore"
                                    autoComplete="off"
                                />
                                <span className="text-muted-foreground font-mono text-sm">.localhost:8000</span>
                            </div>
                            <InputError message={errors.subdomain} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="primary_color">Brand color</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="primary_color"
                                    type="color"
                                    className="h-10 w-20 cursor-pointer p-1"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                />
                                <span className="text-sm text-muted-foreground uppercase font-mono">{data.primary_color}</span>
                            </div>
                            <InputError message={errors.primary_color} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="banner_text">Welcome message (optional)</Label>
                            <Input
                                id="banner_text"
                                value={data.banner_text}
                                onChange={(e) => setData('banner_text', e.target.value)}
                                placeholder="e.g. Free shipping this week"
                            />
                            <InputError message={errors.banner_text} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="logo_url">Logo URL (optional)</Label>
                            <Input
                                id="logo_url"
                                value={data.logo_url}
                                onChange={(e) => setData('logo_url', e.target.value)}
                                placeholder="https://..."
                            />
                            <InputError message={errors.logo_url} />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={processing} className="w-full sm:w-auto gap-2">
                                <Store className="w-4 h-4" />
                                {processing ? 'Creating...' : 'Create My Store'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
