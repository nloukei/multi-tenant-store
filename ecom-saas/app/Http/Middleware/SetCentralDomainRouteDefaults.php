<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

// Fills in the missing "central" piece of your URLs so route('login') and Ziggy work on the main app host.
class SetCentralDomainRouteDefaults
{
    // Run on every web request, before the page is built.
    public function handle(Request $request, Closure $next): Response
    {
        // Only on the main app (e.g. localhost), not on tenant subdomains like store.localhost.
        if (in_array($request->getHost(), config('tenancy.central_domains', []), true)) {
            // Tell Laravel: when a route needs {central}, use the same host the user is visiting.
            URL::defaults(['central' => $request->getHost()]);
        }

        // Continue to the next middleware or controller.
        return $next($request);
    }
}
