<?php

use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tenants = Tenant::all();
foreach ($tenants as $tenant) {
    $domain = $tenant->id . '.tenantly.software';
    
    $exists = Domain::where('domain', $domain)->exists();
    
    if (!$exists) {
        echo "Creating domain: $domain for tenant: {$tenant->id}\n";
        Domain::create([
            'domain' => $domain,
            'tenant_id' => $tenant->id,
        ]);
    } else {
        echo "Domain $domain already exists for tenant: {$tenant->id}\n";
    }
}
