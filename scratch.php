<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tenant = \App\Models\Tenant::first();
    \Stancl\Tenancy\Facades\Tenancy::initialize($tenant);
    echo "Tenant connection config:\n";
    print_r(config('database.connections.tenant'));
    echo "\nDefault connection: " . config('database.default') . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
