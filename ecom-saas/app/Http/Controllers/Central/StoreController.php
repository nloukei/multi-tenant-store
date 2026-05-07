<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Facades\Tenancy;

// This controller handles creating new stores (tenants) from the central app
// When a store is created, it:
// 1. Creates a Tenant record in central database
// 2. Creates a domain for the tenant
// 3. Auto-creates an admin customer in the tenant's database
class StoreController extends Controller
{
    // Store method: Handle store creation request from frontend
    public function store(Request $request)
    {
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

        // Create the new tenant record in central database
        $tenant = Tenant::create([
            'id' => $validated['subdomain'],  // Tenant ID is same as subdomain
            'store_name' => $validated['store_name'],
            'user_id' => $user->id,  // Link tenant to this user
            'plan_id' => $freePlan->id,  // Assign free plan
            'trial_ends_at' => now()->addDays(14),  // 14-day trial
            'primary_color' => $request->input('primary_color', '#1d4ed8'),
            'logo_url' => $request->filled('logo_url') ? $request->string('logo_url')->toString() : null,
            'banner_text' => $banner,
        ]);

        // Create domain record linking subdomain to this tenant
        $tenant->domains()->create([
            'domain' => $validated['subdomain'].'.localhost',
        ]);

        try {
            // Switch to the newly created tenant's database
            Tenancy::initialize($tenant);

            // Create or update admin customer for this user in the tenant database
            Customer::query()->updateOrCreate(
                ['email' => $user->email],  // Find by email
                [
                    'name' => $user->name,
                    'password' => $user->password,  // Use same password as central user
                    'role' => 'admin',  // This customer is an admin in their own store
                ]
            );
        } finally {
            // Always switch back to central database
            Tenancy::end();
        }

        return redirect()->back()->with('message', 'Store created successfully!');
    }
}
