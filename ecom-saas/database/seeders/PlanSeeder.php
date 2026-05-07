<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            ['name' => 'Free', 'slug' => 'free', 'description' => 'Get started at no cost.'],
            ['name' => 'Basic', 'slug' => 'basic', 'description' => 'Growing businesses.'],
            ['name' => 'Pro', 'slug' => 'pro', 'description' => 'Full feature set.'],
        ];

        foreach ($plans as $plan) {
            Plan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
