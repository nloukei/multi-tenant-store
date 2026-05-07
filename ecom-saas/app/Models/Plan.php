<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class, 'plan_id');
    }
}
