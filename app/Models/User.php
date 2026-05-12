<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// This is the User model - represents users in the CENTRAL app (not in individual tenants)
// Central users can be: super_admin (system owner) or admin (store owners)
// Super admins can create stores and manage everything
// Admins can only manage stores they own
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Role constants - these are the only two roles for central users
    public const ROLE_SUPER_ADMIN = 'super_admin'; // System owner - full access
    public const ROLE_ADMIN = 'admin'; // Store owner - can manage their own stores

    // These fields can be set when creating or updating a user
    protected $fillable = [
        'name',     // User's full name
        'email',    // User's email (must be unique)
        'password', // User's password (auto-hashed by Laravel)
        'role',     // User's role: 'super_admin' or 'admin'
    ];

    // These fields are hidden when converting the user to JSON (for security)
    protected $hidden = [
        'password',        // Never send password to frontend
        'remember_token',  // Never send remember token to frontend
    ];

    // Cast certain fields to specific types
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', // Convert to Carbon datetime object
            'password' => 'hashed',            // Automatically hash password when setting it
        ];
    }

    // Helper method: Check if this user is a super admin
    // Returns true if user's role is 'super_admin'
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    // Helper method: Check if this user is a store admin
    // Returns true if user's role is 'admin'
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    // Relationship: Get all stores (tenants) this user owns
    // Returns a collection of Tenant models
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'user_id');
    }
}
