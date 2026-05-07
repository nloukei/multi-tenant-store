<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// This middleware protects routes that only super admins can access
// It checks if the logged-in user is a super admin
// If not, it stops the request and returns a 403 error
class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the currently logged-in user
        $user = $request->user();

        // Check if user exists AND is a super admin
        // If not, block access with a 403 Forbidden error
        if (! $user || ! $user->isSuperAdmin()) {
            abort(403, 'Super admin access only.');
        }

        // User is super admin, allow the request to continue
        return $next($request);
    }
}
