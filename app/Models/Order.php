<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'stripe_session_id',
        'status',
        'total_amount',
        'currency',
        'customer_location',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
