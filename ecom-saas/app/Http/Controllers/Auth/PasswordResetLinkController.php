<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Str;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($request->input('email'));

        // If user exists, generate a 5-digit code, cache a hashed copy and log
        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $code = (string) random_int(10000, 99999);

            Cache::put(sprintf('user:password_reset_code:%s', $email), [
                'email' => $email,
                'code_hash' => Hash::make($code),
            ], now()->addMinutes(10));

            Log::info('Password reset auth code generated for user.', [
                'email' => $email,
                'auth_code' => $code,
                'expires_in_minutes' => 10,
            ]);
        }

        return to_route('password.sent', ['email' => $email])
            ->with('status', __('If the account exists, a 5-digit code was generated. Check laravel.log.'));
    }

    // Show a simple 'code sent' confirmation page
    public function sentForm(Request $request): Response
    {
        return Inertia::render('auth/code-sent', [
            'email' => $request->string('email')->toString(),
            'status' => $request->session()->get('status'),
        ]);
    }

    // Verify a 5-digit code submitted from the code-sent page
    /**
     * @throws ValidationException
     */
        public function verifyCode(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'digits:5'],
        ]);

        $email = strtolower($validated['email']);

        $payload = Cache::get(sprintf('user:password_reset_code:%s', $email));

        if (! is_array($payload) || ! isset($payload['code_hash']) || ! Hash::check($validated['code'], $payload['code_hash'])) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired auth code.'],
            ]);
        }

        // Mark verified in session for short window
        $request->session()->put($this->verifiedEmailSessionKey(), $email);
        $request->session()->put($this->verifiedAtSessionKey(), now()->timestamp);

        // Redirect to password reset form (central code-based flow)
        return to_route('password.reset.code', ['email' => $email]);
    }

    // Show central reset form after code verification
    public function editResetForm(Request $request): Response
    {
        $email = strtolower($request->string('email')->toString());

        if (! $this->isVerifiedForReset($request, $email)) {
            return Inertia::render('auth/forgot-password', [
                'status' => 'Please verify your 5-digit code first.',
            ]);
        }

        return Inertia::render('auth/reset-password-code', [
            'email' => $email,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function updateReset(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $email = strtolower($validated['email']);

        if (! $this->isVerifiedForReset($request, $email)) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your 5-digit code first.'],
            ]);
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['No account matched this email.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => Str::random(60),
        ])->save();

        // Cleanup
        Cache::forget(sprintf('user:password_reset_code:%s', $email));
        $request->session()->forget([
            $this->verifiedEmailSessionKey(),
            $this->verifiedAtSessionKey(),
        ]);

        return to_route('login')->with('status', 'Password has been reset. You can sign in now.');
    }

    // Session keys for central flow
    private function verifiedEmailSessionKey(): string
    {
        return 'password_reset_verified_email';
    }

    private function verifiedAtSessionKey(): string
    {
        return 'password_reset_verified_at';
    }

    private function isVerifiedForReset(Request $request, string $email): bool
    {
        $verifiedEmail = $request->session()->get($this->verifiedEmailSessionKey());
        $verifiedAt = (int) $request->session()->get($this->verifiedAtSessionKey(), 0);

        if (! $verifiedEmail || $verifiedEmail !== $email) {
            return false;
        }

        if ($verifiedAt <= 0) {
            return false;
        }

        return now()->diffInMinutes(now()->setTimestamp($verifiedAt)) <= 15;
    }
}
