<?php

namespace App\Http\Controllers\Tenant\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

// This controller handles tenant customer login and logout
// Customers log in with email/password to a specific store (tenant)
// After login, they are redirected based on their role (admin or regular customer)
class AuthenticatedSessionController extends Controller
{
    // Show the login form for a store
    public function create(): Response
    {
        return Inertia::render('tenant/auth/login');
    }

    /**
     * Handle login submission
     * Attempts to authenticate with the 'customer' guard (tenant customers)
     * Redirects to admin area if role='admin', otherwise to storefront
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate email and password
        $credentials = $request->validate([
            'email' => ['required', 'email'],  // Must be valid email
            'password' => ['required', 'string'],  // Password required
        ]);

        // Try to authenticate using the 'customer' guard
        // The 'remember' checkbox allows persistent login
        if (! Auth::guard('customer')->attempt($credentials, $request->boolean('remember'))) {
            // Login failed - throw validation error
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),  // "These credentials do not match our records"
            ]);
        }

        // Login successful, regenerate session to prevent session fixation attacks
        $request->session()->regenerate();

        // Get the newly logged-in customer
        $customer = Auth::guard('customer')->user();

        // If customer has role='admin', send to admin dashboard
        // Otherwise, send to regular storefront
        if ($customer && $customer->role === 'admin') {
            return redirect()->intended(route('tenant.admin.overview', absolute: false));
        }

        return redirect()->intended(route('tenant.home', absolute: false));
    }

    // Handle logout
    public function destroy(Request $request): RedirectResponse
    {
        // Log out from the customer guard (tenant login)
        Auth::guard('customer')->logout();

        // Invalidate the session to clear all session data
        $request->session()->invalidate();

        // Regenerate session token for security
        $request->session()->regenerateToken();

        // Redirect back to the store storefront
        return redirect()->route('tenant.home');
    }
}
