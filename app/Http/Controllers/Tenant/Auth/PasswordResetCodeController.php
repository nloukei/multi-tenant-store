<?php

namespace App\Http\Controllers\Tenant\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

// This controller handles the 3-step password reset flow:
// Step 1: Customer enters email → system generates 5-digit code → logs to laravel.log
// Step 2: Customer enters 5-digit code → system verifies it
// Step 3: Customer sets new password → password is updated
//
// The flow uses session variables to track which step the customer is on
class PasswordResetCodeController extends Controller
{
    // Time limits (in minutes)
    private const CODE_TTL_MINUTES = 10;          // Code expires after 10 minutes
    private const VERIFY_TTL_MINUTES = 15;        // Reset window expires after 15 minutes

    // ========================================
    // STEP 1: Show "Forgot Password" form
    // ========================================
    public function create(Request $request): Response
    {
        // Display the email entry form
        return Inertia::render('tenant/auth/forgot-password', [
            'status' => $request->session()->get('status'),  // Show any status messages
        ]);
    }

    // ========================================
    // STEP 1: Process email submission
    // ========================================
    public function store(Request $request): RedirectResponse
    {
        // Validate that an email was submitted
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Normalize email to lowercase
        $email = strtolower($validated['email']);

        // Find customer with this email (don't reveal if email exists or not)
        $customer = Customer::query()->where('email', $email)->first();

        if ($customer) {
            // Generate random 5-digit code (10000-99999)
            $code = (string) random_int(10000, 99999);

            // Store code hash in cache (with 10-minute expiry)
            Cache::put($this->cacheKey($email), [
                'email' => $email,
                'code_hash' => Hash::make($code),  // Hash code for security
            ], now()->addMinutes(self::CODE_TTL_MINUTES));

            // Log the code to laravel.log (for development/testing)
            Log::info('Tenant password reset auth code generated.', [
                'tenant_id' => tenant('id'),
                'email' => $email,
                'auth_code' => $code,  // THE ACTUAL CODE (check laravel.log to use)
                'expires_in_minutes' => self::CODE_TTL_MINUTES,
            ]);
        }

        // Always show same message (don't reveal if email exists)
        // Redirect to an intermediate "code sent" page so the next screen
        // only asks for the 5-digit code after we have generated and logged it.
        return to_route('tenant.password.sent', ['email' => $email])
            ->with('status', 'If the account exists, a 5-digit code was generated. Check laravel.log.');
    }

    // Show intermediate "code was sent" page (step between email submit and code entry)
    public function sentForm(Request $request): Response
    {
        return Inertia::render('tenant/auth/code-sent', [
            'email' => $request->string('email')->toString(),
            'status' => $request->session()->get('status'),
        ]);
    }

    // ========================================
    // STEP 2: Show "Enter Code" form
    // ========================================
    public function verifyForm(Request $request): Response
    {
        // Display the 5-digit code verification form
        return Inertia::render('tenant/auth/verify-reset-code', [
            'email' => $request->string('email')->toString(),  // Pass email through URL
            'status' => $request->session()->get('status'),    // Show any status messages
        ]);
    }

    // ========================================
    // STEP 2: Process code verification
    // ========================================
    /**
     * @throws ValidationException
     */
    public function verifyCode(Request $request): RedirectResponse
    {
        // Validate email and code
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'digits:5'],  // Must be exactly 5 digits
        ]);

        $email = strtolower($validated['email']);

        // Get code data from cache
        $payload = Cache::get($this->cacheKey($email));

        // Check if code exists and matches the hash
        if (! is_array($payload) || ! isset($payload['code_hash']) || ! Hash::check($validated['code'], $payload['code_hash'])) {
            // Code invalid or expired - don't proceed
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired auth code.'],
            ]);
        }

        // Code is valid! Store in session that this email has been verified
        // (so user can proceed to step 3)
        $request->session()->put($this->verifiedEmailSessionKey(), $email);
        $request->session()->put($this->verifiedAtSessionKey(), now()->timestamp);

        // Redirect to password reset form (step 3)
        return to_route('tenant.password.reset', ['email' => $email]);
    }

    // ========================================
    // STEP 3: Show "Set New Password" form
    // ========================================
    public function edit(Request $request): Response
    {
        $email = strtolower($request->string('email')->toString());

        // Check if user has verified their email with the code
        if (! $this->isVerifiedForReset($request, $email)) {
            // Not verified yet - send them back to verify code form
            return Inertia::render('tenant/auth/verify-reset-code', [
                'email' => $email,
                'status' => 'Please verify your 5-digit code first.',
            ]);
        }

        // Email is verified, show password reset form
        return Inertia::render('tenant/auth/reset-password', [
            'email' => $email,
            'status' => $request->session()->get('status'),
        ]);
    }

    // ========================================
    // STEP 3: Process password change
    // ========================================
    /**
     * @throws ValidationException
     */
    public function update(Request $request): RedirectResponse
    {
        // Validate new password
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::defaults()],  // Must match confirmation
        ]);

        $email = strtolower($validated['email']);

        // Verify that user completed step 2 (code verification)
        if (! $this->isVerifiedForReset($request, $email)) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your 5-digit code first.'],
            ]);
        }

        // Find customer with this email
        $customer = Customer::query()->where('email', $email)->first();

        if (! $customer) {
            throw ValidationException::withMessages([
                'email' => ['No account matched this email.'],
            ]);
        }

        // Update the customer's password (will be auto-hashed by model)
        // Also generate new remember_token for security
        $customer->forceFill([
            'password' => $validated['password'],
            'remember_token' => Str::random(60),
        ])->save();

        // Clean up cache and session (reset process is complete)
        Cache::forget($this->cacheKey($email));
        $request->session()->forget([
            $this->verifiedEmailSessionKey(),
            $this->verifiedAtSessionKey(),
        ]);

        // Redirect to login with success message
        return to_route('tenant.login')->with('status', 'Password has been reset. You can sign in now.');
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    // Generate cache key for storing the reset code
    // Each tenant gets separate cache entries
    private function cacheKey(string $email): string
    {
        return sprintf('tenant:%s:password_reset_code:%s', tenant('id') ?? 'unknown', $email);
    }

    // Session key for tracking which email has been verified
    private function verifiedEmailSessionKey(): string
    {
        return sprintf('tenant:%s:password_reset_verified_email', tenant('id') ?? 'unknown');
    }

    // Session key for tracking when verification happened
    private function verifiedAtSessionKey(): string
    {
        return sprintf('tenant:%s:password_reset_verified_at', tenant('id') ?? 'unknown');
    }

    // Check if the reset process is still valid for this email
    // Must have verified code AND not expired the 15-minute window
    private function isVerifiedForReset(Request $request, string $email): bool
    {
        // Get verified email from session
        $verifiedEmail = $request->session()->get($this->verifiedEmailSessionKey());

        // Get verification timestamp from session
        $verifiedAt = (int) $request->session()->get($this->verifiedAtSessionKey(), 0);

        // Email must match and must be set
        if (! $verifiedEmail || $verifiedEmail !== $email) {
            return false;
        }

        // Verification timestamp must exist
        if ($verifiedAt <= 0) {
            return false;
        }

        // Check if verification is still within the 15-minute window
        return now()->diffInMinutes(now()->setTimestamp($verifiedAt)) <= self::VERIFY_TTL_MINUTES;
    }
}
