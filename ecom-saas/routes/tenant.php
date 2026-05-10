<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Tenant\Auth\PasswordResetCodeController;
use App\Http\Controllers\Tenant\Auth\RegisteredCustomerController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
| TENANT ROUTES
| These routes run INSIDE individual stores (e.g., store.localhost:8000)
| They handle: customer login/registration, store frontend, password reset
|
| Key middleware:
| - InitializeTenancyByDomain: Detects which tenant based on domain
| - PreventAccessFromCentralDomains: Blocks access from central domain
| - guest:customer: Only allow NOT logged-in customers
| - tenant_auth: Only allow logged-in customers
| - tenant_admin: Only allow customers with role='admin'
*/

// All tenant routes go through tenancy middleware
Route::middleware([
    'web',
    InitializeTenancyByDomain::class,        // Figure out which tenant this is
    PreventAccessFromCentralDomains::class,  // Don't allow central domain here
])->group(function () {
    // ========================================
    // PUBLIC ROUTES (Guest customers only)
    // ========================================
    Route::middleware('guest:customer')->group(function () {
        // Step 1 of password reset: Enter email
        Route::get('/forgot-password', [PasswordResetCodeController::class, 'create'])
            ->name('tenant.password.request');
        Route::post('/forgot-password', [PasswordResetCodeController::class, 'store'])
            ->name('tenant.password.email');

        // Intermediate page: code was generated and logged — user lands here first
        Route::get('/code-sent', [PasswordResetCodeController::class, 'sentForm'])
            ->name('tenant.password.sent');

        // Step 2 of password reset: Verify 5-digit code
        Route::get('/verify-reset-code', [PasswordResetCodeController::class, 'verifyForm'])
            ->name('tenant.password.verify');
        Route::post('/verify-reset-code', [PasswordResetCodeController::class, 'verifyCode'])
            ->name('tenant.password.verify.store');

        // Step 3 of password reset: Set new password
        Route::get('/reset-password', [PasswordResetCodeController::class, 'edit'])
            ->name('tenant.password.reset');
        Route::post('/reset-password', [PasswordResetCodeController::class, 'update'])
            ->name('tenant.password.update');

        // Customer registration (signup)
        Route::get('/register', [RegisteredCustomerController::class, 'create'])
            ->name('tenant.register');
        Route::post('/register', [RegisteredCustomerController::class, 'store'])
            ->name('tenant.register.store');

        // Customer login
        Route::get('/login', [AuthenticatedSessionController::class, 'create'])
            ->name('tenant.login');
        Route::post('/login', [AuthenticatedSessionController::class, 'store'])
            ->name('tenant.login.store');
    });

    // Store storefront (Publicly accessible)
    Route::get('/', function () {
        // Get all products from the store
        $products = Product::query()->orderBy('name')->get();

        return Inertia::render('tenant/store-front', [
            'products' => $products,
        ]);
    })->name('tenant.home');
    
    Route::get('/cart', function () {
        return Inertia::render('tenant/cart');
    })->name('tenant.cart');

    Route::get('/products/{slug}', function (string $slug) {
        $product = Product::with('category')->where('slug', $slug)->firstOrFail();

        // Get related products from the same category (excluding current)
        $relatedProducts = $product->category_id
            ? Product::where('category_id', $product->category_id)
                ->where('id', '!=', $product->id)
                ->limit(4)
                ->get()
            : collect();

        return Inertia::render('tenant/product-detail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    })->name('tenant.product.show');

    Route::get('/promos', function () {
        $promos = \App\Models\Promo::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('tenant/promos', [
            'promos' => $promos,
        ]);
    })->name('tenant.promos');

    // ========================================
    // PROTECTED ROUTES (Authenticated customers only)
    // ========================================
    Route::middleware('tenant_auth')->group(function () {
        // Logout
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('tenant.logout');

        // Admin-only dashboard (requires role='admin')
        Route::get('/admin/overview', function () {
            return response()->json([
                'message' => 'Tenant admin access granted.',
                'tenant_id' => tenant('id'),
                'owner_id' => tenant('user_id'),
                'customer_id' => auth('customer')->id(),
                'customer_role' => auth('customer')->user()?->role,
            ]);
        })->middleware('tenant_admin')  // Only admins can access
            ->name('tenant.admin.overview');
    });
});
