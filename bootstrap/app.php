<?php

// Boots Laravel and wires routing + middleware (the spine of every HTTP request).

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetCentralDomainRouteDefaults;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureTenantAdmin;
use App\Http\Middleware\EnsureTenantAuthenticated;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // Browser routes, Artisan commands, and a simple "is the app up?" URL.
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'super_admin' => EnsureSuperAdmin::class,
            'tenant_admin' => EnsureTenantAdmin::class,
            'tenant_auth' => EnsureTenantAuthenticated::class,
        ]);

        // "prepend" runs these first on web requests (before session, cookies, etc. where applicable).
        $middleware->web(prepend: [
            SetCentralDomainRouteDefaults::class,
        ]);
        // "append" runs after core web middleware — good for Inertia shared props and extra headers.
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Hook custom error handling / reporting here if you need it.
    })->create();
