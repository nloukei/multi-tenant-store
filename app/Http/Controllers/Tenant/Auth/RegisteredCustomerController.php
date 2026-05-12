<?php

namespace App\Http\Controllers\Tenant\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

// This controller handles customer registration (signup) for a store
// When someone creates a new account in a store, they register as a regular customer
// After signup, they are automatically logged in and redirected to the store
class RegisteredCustomerController extends Controller
{
    // Show the customer registration form
    public function create(): Response
    {
        return Inertia::render('tenant/auth/register');
    }

    /**
     * Handle customer registration submission
     * Creates new customer account and automatically logs them in
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate the registration data
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],  // Full name
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:customers,email'  // Must not already exist in this store
            ],
            'password' => ['required', 'confirmed', Password::defaults()],  // Password with confirmation
        ]);

        // Create the new customer account
        $customer = Customer::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],  // Will be auto-hashed by the model
            'role' => Customer::ROLE_CUSTOMER,  // New customers always start as regular customers
        ]);

        // Fire the Registered event (can be used for sending welcome emails, etc.)
        event(new Registered($customer));

        // Automatically log in the new customer
        Auth::guard('customer')->login($customer);

        // Regenerate session after login
        $request->session()->regenerate();

        // Redirect to the store homepage
        return redirect()->route('tenant.home');
    }
}
