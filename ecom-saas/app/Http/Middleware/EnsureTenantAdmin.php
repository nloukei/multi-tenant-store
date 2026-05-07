<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// This middleware protects tenant admin routes
// Two ways to gain access:
// 1. Be logged in as a customer with role='admin' (store admin customer)
// 2. Be logged in as central user who owns this tenant (super admin or store owner)
class EnsureTenantAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // First, check if a TENANT customer is logged in
        $tenantCustomer = Auth::guard('customer')->user();

        if ($tenantCustomer) {
            // If customer is logged in and has role 'admin', they can access
            if ($tenantCustomer->role === 'admin') {
                return $next($request);
            }

            // Customer is logged in but not admin role, block access
            abort(403, 'Tenant admin access only.');
        }

        // No tenant customer logged in, check if CENTRAL user is logged in
        $user = $request->user();
        $currentTenant = tenant();

        // Can't proceed without both user and tenant
        if (! $user || ! $currentTenant) {
            abort(403, 'Tenant admin access only.');
        }

        // Allow if: super admin OR user owns this tenant
        if ($user->isSuperAdmin() || (int) $currentTenant->user_id === (int) $user->id) {
            return $next($request);
        }

        // None of the above - block access
        abort(403, 'You can only manage tenants you own.');
    }
}
