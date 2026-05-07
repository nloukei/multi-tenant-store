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

    // Update store settings
    public function update(Request $request, string $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        // Authorization check
        $user = $request->user();
        if (!$user->isSuperAdmin() && $tenant->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'primary_color' => ['nullable', 'regex:/^#([0-9A-Fa-f]{6})$/'],
            'banner_text' => ['nullable', 'string', 'max:500'],
            'banner_images.*' => 'nullable|image|max:5120', // Multiple images
            'delete_banners' => 'nullable|array', // Array of indices to delete
        ]);

        // Get existing banners from the tenant's JSON data
        $banners = $tenant->banners ?? [];

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
                $path = $file->store('banners/' . $tenant->id, 'public');
                $banners[] = [
                    'url' => Storage::url($path),
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
            'banners' => $banners,
        ]);

        return redirect()->back()->with('message', 'Store settings updated successfully!');
    }

    // Store method: Handle store creation request from frontend
    public function store(Request $request)
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
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',  // Store display name
            'subdomain' => [
                'required',
                'string',
                'max:63',
                'regex:/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/',  // Valid subdomain format
                // Check if subdomain already exists in domains table
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $fullDomain = $value.'.localhost';
                    if (DB::table('domains')->where('domain', $fullDomain)->exists()) {
                        $fail('The subdomain has already been taken.');
                    }
                },
            ],
            'primary_color' => ['nullable', 'regex:/^#([0-9A-Fa-f]{6})$/'],  // Store theme color
            'logo_url' => ['nullable', 'string', 'max:2048'],  // Store logo URL
            'banner_text' => ['nullable', 'string', 'max:500'],  // Welcome banner text
        ]);

        // Set default banner text if not provided
        $banner = ($validated['banner_text'] ?? '') !== ''
            ? $validated['banner_text']
            : 'Welcome to '.$validated['store_name'];

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
                'banner_text' => $banner,
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
}
