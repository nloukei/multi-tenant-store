<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free', 
                'slug' => 'free', 
                'description' => 'Perfect for testing out your storefront ideas.',
                'price' => 0.00,
                'features' => ['1 Tenant Storefront', 'Standard Subdomain', 'Community Support', 'Basic Analytics'],
            ],
            [
                'name' => 'Basic', 
                'slug' => 'basic', 
                'description' => 'For growing businesses ready to start selling.',
                'price' => 19.00,
                'features' => ['Custom Domain Ready', 'Stripe Checkout Integrated', 'Promo Code Engine', 'Priority Support', 'Unlimited Products'],
            ],
            [
                'name' => 'Pro', 
                'slug' => 'pro', 
                'description' => 'Maximum performance and complete platform access.',
                'price' => 49.00,
                'features' => ['Unlimited Multi-Tenant Stores', 'Premium Theme Access', 'Dedicated Account Mgr', 'Advanced Multi-Tenant Analytics', '0% Extra Platform Fees'],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::query()->updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
