<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Review;
use App\Models\Product;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items', 'reviews'])
            ->where('customer_id', auth('customer')->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('tenant/orders', [
            'orders' => $orders,
            'tenant' => tenant(),
        ]);
    }

    public function storeReview(Request $request, Order $order)
    {
        $request->validate([
            'product_name' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        if ($order->customer_id !== auth('customer')->id()) {
            abort(403);
        }

        $product = Product::where('name', $request->product_name)->first();
        $customer = auth('customer')->user();
        $customerName = $customer ? ($customer->name ?: explode('@', $customer->email)[0]) : 'Verified Customer';

        Review::updateOrCreate([
            'order_id' => $order->id,
            'product_name' => $request->product_name,
        ], [
            'product_id' => $product?->id,
            'customer_name' => $customerName,
            'rating' => (int) $request->rating,
            'comment' => $request->comment,
        ]);

        return redirect()->back();
    }
}
