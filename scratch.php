<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tenants = \App\Models\Tenant::all();
    echo "Found " . $tenants->count() . " tenants in database.\n\n";

    foreach ($tenants as $tenant) {
        $localDomain = $tenant->id . '.localhost';
        
        // Check if the local domain already exists
        $exists = \Stancl\Tenancy\Database\Models\Domain::where('domain', $localDomain)->exists();
        
        if (!$exists) {
            $tenant->domains()->create([
                'domain' => $localDomain
            ]);
            echo "Successfully registered local domain '{$localDomain}' for tenant '{$tenant->id}'!\n";
        } else {
            echo "Local domain '{$localDomain}' is already registered for tenant '{$tenant->id}'.\n";
        }
    }
    
    echo "\nUpdated domains in database:\n";
    $domains = \Stancl\Tenancy\Database\Models\Domain::all();
    foreach ($domains as $d) {
        echo "- Tenant: {$d->tenant_id} | Domain: {$d->domain}\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
