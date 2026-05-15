<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Customer;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        
        if ($products->isEmpty()) {
            return;
        }

        // 1. Create a dummy customer if none exists
        $customer = Customer::first() ?: Customer::create([
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.ph',
            'password' => bcrypt('password'),
        ]);

        // 2. Sample Review Data
        $reviewPool = [
            ['rating' => 5, 'comment' => 'Amazing product! The build quality is top-notch and it arrived earlier than expected.'],
            ['rating' => 5, 'comment' => 'Sulit na sulit! Sobrang ganda ng quality. High-end retail feel talaga.'],
            ['rating' => 4, 'comment' => 'Good value for money. Minor scratches on the box but the item itself is perfect.'],
            ['rating' => 5, 'comment' => 'Best purchase this year. Highly recommended to everyone looking for premium tech.'],
            ['rating' => 4, 'comment' => 'Legit seller. Item is 100% authentic. Will buy again!'],
            ['rating' => 3, 'comment' => 'Decent product but the shipping took a bit longer than I liked.'],
            ['rating' => 5, 'comment' => 'Wow! Just wow. This exceeded my expectations. 5 stars!'],
        ];

        // 3. Create reviews for each product
        foreach ($products as $product) {
            // Create 1-3 reviews per product
            $numReviews = rand(1, 3);
            
            for ($i = 0; $i < $numReviews; $i++) {
                // Create a dummy order for this review if needed
                // (Reviews are linked to orders in this schema)
                $order = Order::create([
                    'customer_id' => $customer->id,
                    'stripe_session_id' => 'seed_' . Str::random(10),
                    'status' => 'arrived',
                    'total_amount' => $product->price * 100, // in cents
                    'currency' => 'PHP',
                    'customer_location' => 'Quezon City, Metro Manila',
                ]);

                // Create Order Item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_name' => $product->name,
                    'quantity' => 1,
                    'unit_price' => $product->price * 100,
                ]);

                // Select a random review from the pool
                $reviewData = $reviewPool[array_rand($reviewPool)];

                Review::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'customer_name' => $customer->name,
                    'rating' => $reviewData['rating'],
                    'comment' => $reviewData['comment'],
                ]);
            }
        }
    }
}
