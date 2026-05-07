<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// This middleware protects tenant routes that require login
// It checks if a customer is logged into the current tenant
// If not logged in, redirects to the tenant login page
class EnsureTenantAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if a customer is currently logged in to this tenant
        if (Auth::guard('customer')->check()) {
            // Logged in, allow access
            return $next($request);
        }

        // Not logged in, redirect to tenant login page
        return redirect()->route('tenant.login');
    }
}
