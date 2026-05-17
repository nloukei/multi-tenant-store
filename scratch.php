<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tables = \Illuminate\Support\Facades\DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    echo "Tables in public schema:\n";
    foreach ($tables as $t) {
        echo "- " . $t->table_name . "\n";
    }
    
    $searchPath = \Illuminate\Support\Facades\DB::select("SHOW search_path");
    echo "\nsearch_path: " . print_r($searchPath, true) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
