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

// All central routes must match the central domain
Route::domain('{central}')
    ->where(['central' => $centralHostsPattern])
    ->group(function () {
        /*
        | LOCAL DEVELOPMENT ONLY: Seed a test tenant
        | Visit http://localhost:8000/__dev/seed-store-tenant to create a test store
        | Then you can access it at http://store.localhost:8000
        */
        if (app()->environment('local')) {
            Route::get('/__dev/seed-store-tenant', function () {
                // Create or find test tenant
                $tenant = Tenant::query()->find('store')
                    ?? Tenant::create(['id' => 'store']);

                // Create domain linking to this tenant
                $tenant->domains()->firstOrCreate(
                    ['domain' => 'store.localhost'],
                );

                return response()->json([
                    'message' => 'Tenant + domain ready.',
                    'tenant_id' => $tenant->id,
                    'domain' => 'store.localhost',
                    'central' => url('/'),
                    'tenant_url' => 'http://store.localhost:8000',
                ]);
            });
        }

        // Create a new store (requires authentication)
        Route::post('/stores', [StoreController::class, 'store'])
            ->middleware('auth')
            ->name('stores.store');

        // Home page (publicly accessible)
        Route::get('/', function () {
            return Inertia::render('welcome');
        })->name('home');

        // Protected routes (require login)
        Route::middleware(['auth'])->group(function () {
            // Central dashboard
            Route::get('dashboard', function () {
                return Inertia::render('dashboard');
            })->name('dashboard');
        });

        // Load authentication routes (login, register, password reset)
        require __DIR__.'/settings.php';
        require __DIR__.'/auth.php';
    });
