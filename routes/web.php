<?php

use App\Http\Controllers\Central\StoreController;
use App\Models\Tenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
| CENTRAL APP ROUTES
| These routes run on the main domain (localhost:8000)
| They handle: user login/registration, store creation, central dashboard
|
| Central domains pattern: Matches only the central domain(s) from config
| Tenant domains (like store.localhost) will NOT match these routes
*/

// Build regex pattern of allowed central domains
$centralHostsPattern = collect(config('tenancy.central_domains'))
    ->map(fn(string $d) => preg_quote($d, '/'))
    ->implode('|');

// Public Central Routes
Route::domain('{central}')
    ->where(['central' => $centralHostsPattern])
    ->group(function () {
        // Local Dev Seed
        if (app()->environment('local')) {
            Route::get('/__dev/seed-store-tenant', function () {
                $tenant = Tenant::query()->find('store') ?? Tenant::create(['id' => 'store']);
                $tenant->domains()->firstOrCreate(['domain' => 'store.localhost']);
                return response()->json(['message' => 'Tenant + domain ready.']);
            });
        }

        // Home page
        Route::get('/', function () {
            $plans = \App\Models\Plan::query()->orderBy('price', 'asc')->get();
            return Inertia::render('welcome', [
                'plans' => $plans,
            ]);
        })->name('home');

        // Load authentication routes
        require __DIR__ . '/settings.php';
        require __DIR__ . '/auth.php';
    });

// Protected Global Routes (Dashboard & Store Management)
// These are outside the {central} domain group to prevent 404s on localhost
Route::middleware(['web', 'auth'])->group(function () {

    // Central dashboard
    Route::get('dashboard', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $tenants = [];

        if ($user->isSuperAdmin()) {
            $tenants = Tenant::with(['domains', 'owner', 'plan'])->get();
        } else if ($user->isAdmin()) {
            $tenants = $user->tenants()->with(['domains', 'plan'])->get();
        }

        return Inertia::render('dashboard', [
            'tenants' => $tenants,
        ]);
    })->name('dashboard');

    // Store management
    Route::get('/stores/create', [StoreController::class, 'create'])->name('stores.create');
    Route::post('/stores', [StoreController::class, 'store'])->name('stores.store');
    Route::get('/stores/{tenant}/edit', [StoreController::class, 'edit'])->name('stores.edit');
    Route::get('/stores/{tenant}/products', [StoreController::class, 'products'])->name('stores.products');
    Route::post('/stores/{tenant}/products', [StoreController::class, 'storeProduct'])->name('stores.products.store');
    Route::post('/stores/{tenant}/products/{product}', [StoreController::class, 'updateProduct'])->name('stores.products.update');
    Route::delete('/stores/{tenant}/products/{product}', [StoreController::class, 'destroyProduct'])->name('stores.products.destroy');
    Route::get('/stores/{tenant}/categories', [StoreController::class, 'categories'])->name('stores.categories');
    Route::post('/stores/{tenant}/categories', [StoreController::class, 'storeCategory'])->name('stores.categories.store');
    Route::patch('/stores/{tenant}/categories/{category}', [StoreController::class, 'updateCategory'])->name('stores.categories.update');
    Route::delete('/stores/{tenant}/categories/{category}', [StoreController::class, 'destroyCategory'])->name('stores.categories.destroy');
    Route::get('/stores/{tenant}/promos', [StoreController::class, 'promos'])->name('stores.promos');
    Route::post('/stores/{tenant}/promos', [StoreController::class, 'storePromo'])->name('stores.promos.store');
    Route::post('/stores/{tenant}/promos/{promo}', [StoreController::class, 'updatePromo'])->name('stores.promos.update');
    Route::delete('/stores/{tenant}/promos/{promo}', [StoreController::class, 'destroyPromo'])->name('stores.promos.destroy');
    Route::get('/stores/{tenant}/orders', [StoreController::class, 'orders'])->name('stores.orders');
    Route::patch('/stores/{tenant}/orders/{order}/status', [StoreController::class, 'updateOrderStatus'])->name('stores.orders.status');
    Route::patch('/stores/{tenant}', [StoreController::class, 'update'])->name('stores.update');

    // Subscription & Plan management
    Route::get('/stores/{tenant}/plan', [StoreController::class, 'editPlan'])->name('stores.plan');
    Route::patch('/stores/{tenant}/plan', [StoreController::class, 'updatePlan'])->name('stores.plan.update');
    Route::get('/stores/{tenant}/plan/checkout-success', [StoreController::class, 'planCheckoutSuccess'])->name('stores.plan.checkout.success');
    Route::get('/stores/{tenant}/plan/checkout-cancel', [StoreController::class, 'planCheckoutCancel'])->name('stores.plan.checkout.cancel');
    Route::post('/stores/{tenant}/cancel', [StoreController::class, 'cancelPlan'])->name('stores.plan.cancel');
    Route::post('/stores/{tenant}/resume', [StoreController::class, 'resumePlan'])->name('stores.plan.resume');
});
