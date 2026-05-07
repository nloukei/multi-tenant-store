<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// This is the Customer model - represents customers INSIDE each tenant's database
// Customers can be: 'admin' (store owner/admin) or 'customer' (regular shopper)
// This model is used for authenticating tenant users (people who log into individual stores)
class Customer extends Authenticatable
{
    use HasFactory, Notifiable;

    // Role constant for regular customers
    public const ROLE_CUSTOMER = 'customer'; // Regular shopper in the store

    // These fields can be set when creating or updating a customer
    protected $fillable = [
        'name',     // Customer's full name
        'email',    // Customer's email
        'password', // Customer's password (auto-hashed)
        'role',     // Customer's role: 'admin' or 'customer'
    ];

    // Hide these fields when converting to JSON (for security)
    protected $hidden = [
        'password',        // Never expose password
        'remember_token',  // Never expose remember token
    ];

    // Automatically format certain fields
    protected function casts(): array
    {
        return [
            'password' => 'hashed', // Automatically hash password when setting it
        ];
    }
}
