<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Starting total database cleanup...\n";

// 1. Drop all tenant schemas in PostgreSQL
try {
    $schemas = DB::select("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant%'");
    
    foreach ($schemas as $schema) {
        $schemaName = $schema->schema_name;
        echo "Dropping tenant schema: {$schemaName}...\n";
        DB::statement("DROP SCHEMA IF EXISTS \"{$schemaName}\" CASCADE");
    }
} catch (\Exception $e) {
    echo "Note: Could not drop schemas (maybe not using Postgres or permissions issue): " . $e->getMessage() . "\n";
}

// 2. Run migrate:fresh --seed
echo "Running migrate:fresh --seed for central database...\n";
$exitCode = \Illuminate\Support\Facades\Artisan::call('migrate:fresh', [
    '--seed' => true,
    '--force' => true,
]);

if ($exitCode === 0) {
    echo "SUCCESS: Database and schemas cleaned and reset.\n";
} else {
    echo "ERROR: Migration failed with exit code {$exitCode}.\n";
    echo \Illuminate\Support\Facades\Artisan::output();
}
