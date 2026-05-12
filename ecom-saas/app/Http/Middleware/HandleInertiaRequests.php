<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'tenant_auth' => fn (): ?array => Auth::guard('customer')->check() ? [
                'id' => Auth::guard('customer')->id(),
                'email' => Auth::guard('customer')->user()?->email,
                'role' => Auth::guard('customer')->user()?->role,
                'name' => Auth::guard('customer')->user()?->name,
                'saved_locations' => Auth::guard('customer')->user()?->saved_locations ?? [],
            ] : null,
            // Closure: resolved when Inertia builds the page (after tenancy middleware has run).
            'tenant' => fn (): ?array => tenant() ? [
                'id' => tenant('id'),
                'store_name' => tenant('store_name'),
                'name' => tenant('store_name') ?? tenant('name'),
                'primary_color' => tenant('primary_color'),
                'currency' => tenant('currency'),
                'logo_url' => tenant('logo_url'),
                'banner_text' => tenant('banner_text'),
                'banners' => tenant('banners'),
                'plan_id' => tenant('plan_id'),
                'trial_ends_at' => tenant()?->trial_ends_at?->toIso8601String(),
                'categories' => \App\Models\Category::with('children')->whereNull('parent_id')->orderBy('name')->get()->toArray(),
            ] : null,
            'flash' => [
                'message' => $request->session()->get('message'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}
