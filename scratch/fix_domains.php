<?php

use App\Models\Tenant;
use Stancl\Tenancy\Database\Models\Domain;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tenants = Tenant::all();
foreach ($tenants as $tenant) {
    if ($tenant->domains()->count() === 0) {
        $domain = $tenant->id . '.tenantly.software';
        echo "Creating domain: $domain for tenant: {$tenant->id}\n";
        Domain::create([
            'domain' => $domain,
            'tenant_id' => $tenant->id,
        ]);
    }
}
