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
        return Inertia::render('stores/create');
    }

    // Render the store edit/settings form
    public function edit(Request $request, string $id)
    {
        $tenant = Tenant::with('domains')->findOrFail($id);
        
        // Authorization check: Only owner or super admin
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('stores/edit', [
            'tenant' => $tenant
        ]);
    }

    // View and manage store products
    public function products($id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $tenant->run(function () use (&$products, &$categories) {
            $products = \App\Models\Product::with('category')->orderBy('name')->get()->toArray();
            $categories = \App\Models\Category::orderBy('name')->get()->toArray();
        });

        return Inertia::render('stores/products', [
            'tenant' => $tenant,
            'products' => $products,
            'categories' => $categories,
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
        $tenant = Tenant::findOrFail($id);
        
        $tenant->run(function () use (&$categories) {
            $categories = \App\Models\Category::with('parent')->orderBy('name')->get()->toArray();
        });

        return Inertia::render('stores/categories', [
            'tenant' => $tenant,
            'categories' => $categories,
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

        // Get the default 'free' plan for new stores
        $freePlan = Plan::query()->where('slug', 'free')->firstOrFail();

        // Validate the store creation data
        $validated = $request->validated();

        try {
            Log::info('Creating tenant record...');
            // Create the new tenant record in central database
            $tenant = Tenant::create([
                'id' => $validated['subdomain'],
                'store_name' => $validated['store_name'],
                'user_id' => $user->id,
                'plan_id' => $freePlan->id,
                'trial_ends_at' => now()->addDays(14),
                'primary_color' => $request->input('primary_color', '#1d4ed8'),
                'logo_url' => $request->filled('logo_url') ? $request->string('logo_url')->toString() : null,
                'banner_text' => $validated['banner_text'] ?? null,
                'currency' => $request->input('currency', 'USD'),
            ]);

            try {
                Log::info('Creating domain record: ' . $validated['subdomain'] . '.localhost');
                // Explicitly create domain record using the model
                \Stancl\Tenancy\Database\Models\Domain::create([
                    'domain' => $validated['subdomain'].'.localhost',
                    'tenant_id' => $tenant->id,
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
            return redirect()->back()->with('message', 'Store created successfully!');
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
        $tenant = Tenant::findOrFail($id);

        $tenant->run(function () use (&$promos) {
            $promos = \App\Models\Promo::orderBy('created_at', 'desc')->get()->toArray();
        });

        return Inertia::render('stores/promos', [
            'tenant' => $tenant,
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
        $tenant = Tenant::findOrFail($id);

        $tenant->run(function () use (&$orders) {
            $orders = \App\Models\Order::with(['items', 'customer'])
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
}
