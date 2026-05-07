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
    ->map(fn (string $d) => preg_quote($d, '/'))
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
            return Inertia::render('welcome');
        })->name('home');

        // Load authentication routes
        require __DIR__.'/settings.php';
        require __DIR__.'/auth.php';
    });

// Protected Global Routes (Dashboard & Store Management)
// These are outside the {central} domain group to prevent 404s on localhost
Route::middleware(['web', 'auth'])->group(function () {
    
    // Central dashboard
    Route::get('dashboard', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $tenants = [];
        
        if ($user->isSuperAdmin()) {
            $tenants = Tenant::with(['domains', 'owner'])->get();
        } else if ($user->isAdmin()) {
            $tenants = $user->tenants()->with('domains')->get();
        }

        return Inertia::render('dashboard', [
            'tenants' => $tenants,
        ]);
    })->name('dashboard');

    // Store management
    Route::get('/stores/create', [StoreController::class, 'create'])->name('stores.create');
    Route::post('/stores', [StoreController::class, 'store'])->name('stores.store');
    Route::get('/stores/{tenant}/edit', [StoreController::class, 'edit'])->name('stores.edit');
    Route::patch('/stores/{tenant}', [StoreController::class, 'update'])->name('stores.update');
});
