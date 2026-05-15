<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Facades\Tenancy;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Requests\StoreCreateRequest;
use App\Http\Requests\StoreUpdateRequest;
use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;

// This controller handles creating new stores (tenants) from the central app
// When a store is created, it:
// 1. Creates a Tenant record in central database
// 2. Creates a domain for the tenant
// 3. Auto-creates an admin customer in the tenant's database
class StoreController extends Controller
{
    // Render the store creation form
    public function create()
    {
        $plans = Plan::query()->orderBy('price', 'asc')->get();
        return Inertia::render('stores/create', [
            'plans' => $plans,
        ]);
    }

    // Render the store edit/settings form
    public function edit(Request $request, string $id)
    {
        $tenant = Tenant::with(['domains', 'plan'])->findOrFail($id);
        
        // Authorization check: Only owner or super admin
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $tenant->run(function () use (&$products, &$categories, &$promos) {
            $products = \App\Models\Product::with('category')->orderBy('name')->get()->toArray();
            $categories = \App\Models\Category::orderBy('name')->get()->toArray();
            $promos = \App\Models\Promo::orderBy('created_at', 'desc')->get()->toArray();
        });

        return Inertia::render('stores/edit', [
            'tenant' => $tenant,
            'products' => $products,
            'categories' => $categories,
            'promos' => $promos,
        ]);
    }

    // View and manage store products
    public function products($id)
    {
        $tenant = Tenant::with('domains')->findOrFail($id);
        
        $tenant->run(function () use (&$products, &$categories, &$promos) {
            $products = \App\Models\Product::with('category')->orderBy('name')->get()->toArray();
            $categories = \App\Models\Category::orderBy('name')->get()->toArray();
            $promos = \App\Models\Promo::orderBy('created_at', 'desc')->get()->toArray();
        });

        return Inertia::render('stores/products', [
            'tenant' => $tenant,
            'products' => $products,
            'categories' => $categories,
            'promos' => $promos,
        ]);
    }

    // Create a new product for a store
    public function storeProduct(ProductStoreRequest $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validated();

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products/' . $tenant->id, 'supabase');
            $imageUrl = \Illuminate\Support\Facades\Storage::disk('supabase')->url($path);
        }

        $tenant->run(function () use ($validated, $imageUrl) {
            $slug = \Illuminate\Support\Str::slug($validated['name']);
            // Ensure slug uniqueness
            $count = \App\Models\Product::where('slug', 'like', $slug . '%')->count();
            if ($count > 0) {
                $slug = $slug . '-' . time();
            }

            \App\Models\Product::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'],
                'price' => $validated['price'],
                'compare_at_price' => $validated['compare_at_price'],
                'stock' => $validated['stock'],
                'sku' => $validated['sku'],
                'image_url' => $imageUrl,
                'is_active' => true,
                'category_id' => $validated['category_id'] ?? null,
            ]);
        });

        return redirect()->back()->with('message', 'Product added successfully.');
    }

    // Update an existing product
    public function updateProduct(ProductStoreRequest $request, $id, $productId)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validated();

        $tenant->run(function () use ($validated, $productId, $request, $tenant) {
            $product = \App\Models\Product::findOrFail($productId);
            
            $imageUrl = $product->image_url;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products/' . $tenant->id, 'supabase');
                $imageUrl = \Illuminate\Support\Facades\Storage::disk('supabase')->url($path);
            }

            $product->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'compare_at_price' => $validated['compare_at_price'],
                'stock' => $validated['stock'],
                'sku' => $validated['sku'],
                'image_url' => $imageUrl,
                'category_id' => $validated['category_id'] ?? null,
            ]);
        });

        return redirect()->back()->with('message', 'Product updated successfully.');
    }

    // Delete a product
    public function destroyProduct(Request $request, $id, $productId)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403);
        }

        $tenant->run(function () use ($productId) {
            $product = \App\Models\Product::findOrFail($productId);
            $product->delete();
        });

        return redirect()->back()->with('message', 'Product deleted successfully.');
    }

    // View and manage store categories
    public function categories($id)
    {
        $tenant = Tenant::with('domains')->findOrFail($id);
        
        $tenant->run(function () use (&$products, &$categories, &$promos) {
            $products = \App\Models\Product::with('category')->orderBy('name')->get()->toArray();
            $categories = \App\Models\Category::orderBy('name')->get()->toArray();
            $promos = \App\Models\Promo::orderBy('created_at', 'desc')->get()->toArray();
        });

        return Inertia::render('stores/categories', [
            'tenant' => $tenant,
            'products' => $products,
            'categories' => $categories,
            'promos' => $promos,
        ]);
    }

    // Create a new category for a store
    public function storeCategory(CategoryStoreRequest $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validated();

        $tenant->run(function () use ($validated) {
            \App\Models\Category::create([
                'name' => $validated['name'],
                'slug' => \Illuminate\Support\Str::slug($validated['name']) . '-' . time(),
                'description' => $validated['description'],
                'parent_id' => $validated['parent_id'] ?? null,
            ]);
        });

        return redirect()->back()->with('message', 'Category created successfully.');
    }

    // Update an existing category
    public function updateCategory(CategoryUpdateRequest $request, $id, $categoryId)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validated();

        $tenant->run(function () use ($validated, $categoryId) {
            $category = \App\Models\Category::findOrFail($categoryId);
            $category->update([
                'name' => $validated['name'],
                'slug' => \Illuminate\Support\Str::slug($validated['name']) . '-' . time(),
                'description' => $validated['description'],
                'parent_id' => $validated['parent_id'] ?? null,
            ]);
        });

        return redirect()->back()->with('message', 'Category updated successfully.');
    }

    // Delete a category
    public function destroyCategory(Request $request, $id, $categoryId)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403);
        }

        $tenant->run(function () use ($categoryId) {
            $category = \App\Models\Category::findOrFail($categoryId);
            
            // Set children's parent_id to null before deleting
            \App\Models\Category::where('parent_id', $categoryId)->update(['parent_id' => null]);
            
            $category->delete();
        });

        return redirect()->back()->with('message', 'Category deleted successfully.');
    }

    // Update store settings
    public function update(StoreUpdateRequest $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $validated = $request->validated();

        // Get existing banners from the tenant's JSON data
        $banners = $tenant->banners ?? [];

        // 0. Handle Logo Upload
        if ($request->hasFile('logo_file')) {
            $logoPath = $request->file('logo_file')->store('logos/' . $tenant->id, 'supabase');
            $tenant->logo_url = Storage::disk('supabase')->url($logoPath);
        }

        // 1. Handle Deletions
        if ($request->has('delete_banners')) {
            $indicesToDelete = $request->input('delete_banners');
            $banners = array_filter($banners, function($banner, $index) use ($indicesToDelete) {
                return !in_array($index, $indicesToDelete);
            }, ARRAY_FILTER_USE_BOTH);
            $banners = array_values($banners); // Reset array keys
        }

        // 2. Handle New Uploads
        if ($request->hasFile('banner_images')) {
            foreach ($request->file('banner_images') as $file) {
                // Store on Supabase disk
                $path = $file->store('banners/' . $tenant->id, 'supabase');
                $banners[] = [
                    'url' => Storage::disk('supabase')->url($path),
                    'uploaded_at' => now()->toDateTimeString(),
                ];
            }
        }

        // Update the tenant
        // 'banners' will be automatically stored in the 'data' JSON column
        $tenant->update([
            'store_name' => $validated['store_name'],
            'primary_color' => $validated['primary_color'],
            'banner_text' => $validated['banner_text'],
            'currency' => $validated['currency'] ?? 'USD',
            'logo_url' => $tenant->logo_url,
            'banners' => $banners,
        ]);

        return redirect()->back()->with('message', 'Store settings updated successfully!');
    }

    // Store method: Handle store creation request from frontend
    public function store(StoreCreateRequest $request)
    {
        Log::info('Store creation started for subdomain: ' . $request->subdomain);
        // Get the logged-in central user
        $user = $request->user();

        // If user is not already an admin, promote them to admin role
        if (! $user->isSuperAdmin() && ! $user->isAdmin()) {
            $user->forceFill(['role' => $user::ROLE_ADMIN])->save();
        }

        // Validate the store creation data
        $validated = $request->validated();

        // Determine selected plan (fallback to free)
        $planSlug = $validated['plan_slug'] ?? 'free';
        $selectedPlan = Plan::query()->where('slug', $planSlug)->firstOrFail();

        try {
            Log::info('Creating tenant record...');
            // Create the new tenant record in central database
            $tenant = Tenant::create([
                'id' => $validated['subdomain'],
                'store_name' => $validated['store_name'],
                'user_id' => $user->id,
                'plan_id' => $selectedPlan->id,
                'trial_ends_at' => now()->addDays(14),
                'primary_color' => $request->input('primary_color', '#1d4ed8'),
                'logo_url' => $request->filled('logo_url') ? $request->string('logo_url')->toString() : null,
                'banner_text' => $validated['banner_text'] ?? null,
                'currency' => $request->input('currency', 'USD'),
            ]);

            // Restore the PostgreSQL search path to public
            // The Tenancy package's SchemaManager sometimes leaves the connection
            // pointing to the newly created tenant schema, breaking central queries.
            \Illuminate\Support\Facades\DB::statement("SET search_path TO public");

            try {
                // Use the current request host as the base for the tenant subdomain
                // Fallback to tenantly.software if on localhost to match branding
                $centralDomain = $request->getHost();
                if (in_array($centralDomain, ['localhost', '127.0.0.1'])) {
                    $centralDomain = 'tenantly.software';
                }
                
                $domainName = $validated['subdomain'] . '.' . $centralDomain;

                Log::info('Creating domain record: ' . $domainName);
                
                // Now that search_path is restored, relationships work correctly again
                $tenant->domains()->create([
                    'domain' => $domainName,
                ]);

                Log::info('Initializing tenancy for database setup...');
                Tenancy::initialize($tenant);

                Log::info('Creating admin customer in tenant DB...');
                Customer::query()->updateOrCreate(
                    ['email' => $user->email],
                    [
                        'name' => $user->name,
                        'password' => $user->password,
                        'role' => 'admin',
                    ]
                );
            } catch (\Exception $innerException) {
                // Cleanup the orphaned tenant if domain or initialization fails
                Log::error('Domain creation or initialization failed. Cleaning up tenant: ' . $tenant->id . '. Error: ' . $innerException->getMessage());
                Tenancy::end();
                $tenant->delete(); 
                throw $innerException;
            } finally {
                Tenancy::end();
            }

            Log::info('Store creation completed successfully.');
            
            $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
            $domainName = $validated['subdomain'] . '.' . $centralDomain;

            return redirect()->route('stores.edit', $tenant->id)->with([
                'message' => "Store created successfully! Your 14-day {$selectedPlan->name} Plan trial is now active.",
                'new_store_domain' => $domainName
            ]);
        } catch (\Exception $e) {
            Log::error('Store creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Tenant cannot be created. Reason: ' . $e->getMessage());
        }
    }

    // ========================================
    // PROMO MANAGEMENT
    // ========================================

    // View and manage store promos
    public function promos($id)
    {
        $tenant = Tenant::with('domains')->findOrFail($id);

        $tenant->run(function () use (&$products, &$categories, &$promos) {
            $products = \App\Models\Product::with('category')->orderBy('name')->get()->toArray();
            $categories = \App\Models\Category::orderBy('name')->get()->toArray();
            $promos = \App\Models\Promo::orderBy('created_at', 'desc')->get()->toArray();
        });

        return Inertia::render('stores/promos', [
            'tenant' => $tenant,
            'products' => $products,
            'categories' => $categories,
            'promos' => $promos,
        ]);
    }

    // Create a new promo for a store
    public function storePromo(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'code' => 'required|string|max:50',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('promos/' . $tenant->id, 'supabase');
            $imageUrl = Storage::disk('supabase')->url($path);
        }

        $tenant->run(function () use ($validated, $imageUrl) {
            \App\Models\Promo::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'code' => strtoupper($validated['code']),
                'discount_type' => $validated['discount_type'],
                'discount_value' => $validated['discount_value'],
                'min_purchase' => $validated['min_purchase'] ?? null,
                'starts_at' => $validated['starts_at'] ?? null,
                'ends_at' => $validated['ends_at'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'image_url' => $imageUrl,
            ]);
        });

        return redirect()->back()->with('message', 'Promo created successfully.');
    }

    // Update an existing promo
    public function updatePromo(Request $request, $id, $promoId)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'code' => 'required|string|max:50',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('promos/' . $tenant->id, 'supabase');
            $imageUrl = Storage::disk('supabase')->url($path);
        }

        $tenant->run(function () use ($validated, $promoId, $imageUrl) {
            $promo = \App\Models\Promo::findOrFail($promoId);
            $promo->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'code' => strtoupper($validated['code']),
                'discount_type' => $validated['discount_type'],
                'discount_value' => $validated['discount_value'],
                'min_purchase' => $validated['min_purchase'] ?? null,
                'starts_at' => $validated['starts_at'] ?? null,
                'ends_at' => $validated['ends_at'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
                'image_url' => $imageUrl ?? $promo->image_url,
            ]);
        });

        return redirect()->back()->with('message', 'Promo updated successfully.');
    }

    // Delete a promo
    public function destroyPromo($id, $promoId)
    {
        $tenant = Tenant::findOrFail($id);

        $tenant->run(function () use ($promoId) {
            \App\Models\Promo::findOrFail($promoId)->delete();
        });

        return redirect()->back()->with('message', 'Promo deleted successfully.');
    }
    // ========================================
    // ORDER MANAGEMENT
    // ========================================

    // View and manage store orders
    public function orders($id)
    {
        $tenant = Tenant::with('domains')->findOrFail($id);

        $tenant->run(function () use (&$orders) {
            $orders = \App\Models\Order::with(['items', 'customer', 'reviews'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->toArray();
        });

        return Inertia::render('stores/orders', [
            'tenant' => $tenant,
            'orders' => $orders,
        ]);
    }

    // Update order status
    public function updateOrderStatus(Request $request, $id, $orderId)
    {
        $tenant = Tenant::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,shipping,arrived,cancelled'
        ]);

        $tenant->run(function () use ($validated, $orderId) {
            \App\Models\Order::findOrFail($orderId)->update([
                'status' => $validated['status']
            ]);
        });

        return redirect()->back()->with('message', 'Order status updated successfully.');
    }

    // ========================================
    // SUBSCRIPTION & PLAN MANAGEMENT
    // ========================================

    // Render the store plan management page
    public function editPlan(Request $request, string $id)
    {
        $tenant = Tenant::with(['domains', 'plan'])->findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $plans = Plan::query()->orderBy('price', 'asc')->get();

        return Inertia::render('stores/plan', [
            'tenant' => $tenant,
            'plans' => $plans,
        ]);
    }

    // Upgrade or switch subscription plan
    public function updatePlan(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'plan_slug' => 'required|string|exists:plans,slug',
        ]);

        $selectedPlan = Plan::query()->where('slug', $validated['plan_slug'])->firstOrFail();

        // If plan is free or price is 0, update directly without Stripe Payment
        if ($selectedPlan->price <= 0) {
            $tenant->update([
                'plan_id' => $selectedPlan->id,
                'cancel_at_period_end' => false,
            ]);

            return redirect()->route('stores.edit', $tenant->id)->with('message', "Successfully switched to the {$selectedPlan->name} Plan!");
        }

        // For paid plans, redirect to Stripe Payment first
        $stripeSecret = config('services.stripe.secret');

        if (!$stripeSecret) {
            return redirect()->back()->with('error', 'Stripe is not configured. Please add STRIPE_SECRET to your .env file to process payments.');
        }

        $stripe = new \Stripe\StripeClient($stripeSecret);

        try {
            $session = $stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => [
                    [
                        'price_data' => [
                            'currency' => strtolower($tenant->currency ?? 'usd'),
                            'product_data' => [
                                'name' => "{$selectedPlan->name} Plan Subscription - {$tenant->store_name}",
                                'description' => $selectedPlan->description,
                            ],
                            'unit_amount' => (int) round($selectedPlan->price * 100),
                        ],
                        'quantity' => 1,
                    ],
                ],
                'mode' => 'payment',
                'success_url' => route('stores.plan.checkout.success', ['tenant' => $tenant->id], true) . '?session_id={CHECKOUT_SESSION_ID}&plan_slug=' . $selectedPlan->slug,
                'cancel_url' => route('stores.plan.checkout.cancel', ['tenant' => $tenant->id], true),
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'plan_id' => $selectedPlan->id,
                    'plan_slug' => $selectedPlan->slug,
                ],
            ]);

            return Inertia::location($session->url);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Stripe session creation failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Payment gateway error: ' . $e->getMessage());
        }
    }

    // Handle successful redirection back from Stripe checkout
    public function planCheckoutSuccess(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $planSlug = $request->query('plan_slug');
        $sessionId = $request->query('session_id');

        if ($sessionId && config('services.stripe.secret')) {
            try {
                $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
                $sessionData = $stripe->checkout->sessions->retrieve($sessionId);
                if (!empty($sessionData->metadata->plan_slug)) {
                    $planSlug = $sessionData->metadata->plan_slug;
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Stripe session retrieve error: ' . $e->getMessage());
            }
        }

        if ($planSlug) {
            $selectedPlan = Plan::query()->where('slug', $planSlug)->first();
            if ($selectedPlan) {
                $tenant->update([
                    'plan_id' => $selectedPlan->id,
                    'cancel_at_period_end' => false,
                ]);

                return redirect()->route('stores.edit', $tenant->id)->with('message', "Payment successful! Successfully upgraded to the {$selectedPlan->name} Plan.");
            }
        }

        return redirect()->route('stores.plan', $tenant->id)->with('message', "Plan updated successfully.");
    }

    // Handle cancelled redirection back from Stripe checkout
    public function planCheckoutCancel(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        return redirect()->route('stores.plan', $tenant->id)->with('error', 'Payment cancelled. Your subscription plan remains unchanged.');
    }

    // Schedule subscription cancellation for next month
    public function cancelPlan(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Set virtual attribute to cancel at period end (next month)
        $tenant->update([
            'cancel_at_period_end' => true,
        ]);

        return redirect()->back()->with('message', 'Subscription scheduled for cancellation. Your current plan benefits will remain fully active until next month.');
    }

    // Resume subscription cancellation
    public function resumePlan(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Set cancel_at_period_end to false to resume subscription
        $tenant->update([
            'cancel_at_period_end' => false,
        ]);

        return redirect()->back()->with('message', 'Subscription cancellation has been reversed. Your plan is now active again.');
    }
}
