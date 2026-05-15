<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$affected = DB::table('domains')
    ->where('domain', 'like', '%.localhost')
    ->get()
    ->each(function($domain) {
        $newDomain = str_replace('.localhost', '.tenantly.software', $domain->domain);
        DB::table('domains')->where('id', $domain->id)->update(['domain' => $newDomain]);
        echo "Updated {$domain->domain} to {$newDomain}\n";
    });

echo "Done. Affected: " . count($affected) . "\n";
