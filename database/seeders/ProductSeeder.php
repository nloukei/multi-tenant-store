<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create Tech Categories
        $categories = [
            [
                'name' => 'Laptops', 
                'description' => 'Premium ultrabooks and productivity machines.',
            ],
            [
                'name' => 'Gaming Laptops', 
                'description' => 'High-refresh rate displays and powerful dedicated graphics.',
            ],
            [
                'name' => 'Graphics Cards', 
                'description' => 'The latest GPUs from NVIDIA and AMD for gaming and AI.',
            ],
            [
                'name' => 'Monitors', 
                'description' => '4K, Ultrawide, and high-refresh rate displays.',
            ],
            [
                'name' => 'Peripherals', 
                'description' => 'Mechanical keyboards, gaming mice, and professional headsets.',
            ],
        ];

        $createdCategories = [];
        foreach ($categories as $cat) {
            $createdCategories[$cat['name']] = Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'description' => $cat['description'],
            ]);
        }

        // 2. Add Products for each Category
        
        // Laptops
        $this->seedProducts($createdCategories['Laptops'], [
            [
                'name' => 'MacBook Pro 14" (M3 Max)',
                'price' => 3199.00,
                'description' => 'Apple M3 Max chip with 14‑core CPU, 30‑core GPU, 36GB Unified Memory, 1TB SSD storage.',
                'image_url' => 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800',
            ],
            [
                'name' => 'Dell XPS 13 Plus',
                'price' => 1499.00,
                'description' => '13th Gen Intel Core i7-1360P, 16GB LPDDR5, 512GB SSD, 13.4" FHD+ Touch display.',
                'image_url' => 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800',
            ],
            [
                'name' => 'Microsoft Surface Laptop 5',
                'price' => 1299.00,
                'description' => 'Intel Core i7, 16GB RAM, 512GB SSD, 13.5" PixelSense touchscreen.',
                'image_url' => 'https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?q=80&w=800',
            ],
        ]);

        // Gaming Laptops
        $this->seedProducts($createdCategories['Gaming Laptops'], [
            [
                'name' => 'ASUS ROG Zephyrus G14',
                'price' => 1599.00,
                'description' => 'Ryzen 9 7940HS, RTX 4060, 16GB DDR5, 1TB SSD, 14" QHD+ 165Hz.',
                'image_url' => 'https://images.unsplash.com/photo-1544116150-1d8995a3141e?q=80&w=800',
            ],
            [
                'name' => 'Razer Blade 16',
                'price' => 3599.00,
                'description' => 'Intel Core i9-13950HX, RTX 4080, 32GB RAM, 1TB SSD, Dual Mode Mini-LED display.',
                'image_url' => 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800',
            ],
            [
                'name' => 'Alienware m18 Gaming Laptop',
                'price' => 2499.00,
                'description' => 'AMD Ryzen 9 7845HX, RTX 4070, 32GB RAM, 1TB SSD, 18-inch QHD+ 165Hz.',
                'image_url' => 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=800',
            ],
        ]);

        // Graphics Cards
        $this->seedProducts($createdCategories['Graphics Cards'], [
            [
                'name' => 'NVIDIA GeForce RTX 4090 FE',
                'price' => 1599.00,
                'description' => 'The ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.',
                'image_url' => 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=800',
            ],
            [
                'name' => 'ASUS ROG Strix RTX 4080 Super',
                'price' => 1249.00,
                'description' => 'Enhanced cooling and power delivery for the fastest RTX 4080 experience.',
                'image_url' => 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800',
            ],
            [
                'name' => 'AMD Radeon RX 7900 XTX',
                'price' => 949.00,
                'description' => 'The most advanced graphics for gamers and creators, powered by AMD RDNA 3 architecture.',
                'image_url' => 'https://images.unsplash.com/photo-1555617766-c94804975da3?q=80&w=800',
            ],
        ]);

        // Monitors
        $this->seedProducts($createdCategories['Monitors'], [
            [
                'name' => 'Samsung Odyssey OLED G9',
                'price' => 1799.00,
                'description' => '49-inch curved DQHD, 240Hz, 0.03ms response time, Smart TV experience.',
                'image_url' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800',
            ],
            [
                'name' => 'LG UltraGear 27GR95QE-B',
                'price' => 899.00,
                'description' => '27-inch OLED QHD 240Hz 0.03ms G-Sync Compatible gaming monitor.',
                'image_url' => 'https://images.unsplash.com/photo-1547115941-079042097ee2?q=80&w=800',
            ],
            [
                'name' => 'Dell UltraSharp 32 4K USB-C Hub',
                'price' => 749.00,
                'description' => 'U3223QE with IPS Black technology, built-in 10Gbps USB hub, and 90W power delivery.',
                'image_url' => 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=800',
            ],
        ]);

        // Peripherals
        $this->seedProducts($createdCategories['Peripherals'], [
            [
                'name' => 'Logitech G Pro X Superlight 2',
                'price' => 159.00,
                'description' => 'Wireless gaming mouse, 60g lightweight, HERO 2 sensor, 2000Hz polling.',
                'image_url' => 'https://images.unsplash.com/photo-1527814050087-379371549a28?q=80&w=800',
            ],
            [
                'name' => 'Keychron Q1 Max QMK/VIA',
                'price' => 189.00,
                'description' => '75% layout, full metal body, wireless mechanical keyboard, hot-swappable.',
                'image_url' => 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800',
            ],
            [
                'name' => 'Sony WH-1000XM5',
                'price' => 399.00,
                'description' => 'Industry-leading noise canceling wireless headphones with crystal clear calls.',
                'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
            ],
        ]);
    }

    /**
     * Helper to seed products for a specific category.
     */
    private function seedProducts($category, $products)
    {
        foreach ($products as $prod) {
            Product::create([
                'category_id' => $category->id,
                'name' => $prod['name'],
                'slug' => Str::slug($prod['name']) . '-' . Str::random(6),
                'description' => $prod['description'],
                'price' => $prod['price'],
                'stock' => rand(5, 50),
                'image_url' => $prod['image_url'], // If null, UI shows gray box
                'is_active' => true,
            ]);
        }
    }
}
