<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    /**
     * Real database columns (everything else is stored in the JSON `data` column via VirtualColumn).
     *
     * @see \Stancl\VirtualColumn\VirtualColumn::getCustomColumns()
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'store_name',
            'user_id',
            'plan_id',
            'trial_ends_at',
            'tenancy_db_name',
            'created_at',
            'updated_at',
            'data',
        ];
    }

    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
        ];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
