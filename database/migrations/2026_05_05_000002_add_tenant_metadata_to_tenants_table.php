<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('store_name')->nullable()->after('id');
            $table->foreignId('user_id')->nullable()->after('store_name')->constrained('users')->nullOnDelete();
            $table->foreignId('plan_id')->nullable()->after('user_id')->constrained('plans')->nullOnDelete();
            $table->timestamp('trial_ends_at')->nullable()->after('plan_id');
            $table->string('tenancy_db_name')->nullable()->after('trial_ends_at');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['plan_id']);
            $table->dropColumn(['store_name', 'user_id', 'plan_id', 'trial_ends_at', 'tenancy_db_name']);
        });
    }
};
