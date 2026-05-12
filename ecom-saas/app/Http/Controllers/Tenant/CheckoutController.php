<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\StripeClient;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;

class CheckoutController extends Controller
{
    /**
     * Create a Stripe Checkout Session.
     */
    public function checkout(Request $request)
    {
        $stripeSecret = config('services.stripe.secret');

        if (!$stripeSecret) {
            return response()->json([
                'error' => 'Stripe is not configured. Please add STRIPE_SECRET to your .env file.'
            ], 500);
        }

        $stripe = new StripeClient($stripeSecret);

        $items = $request->input('items', []);
        $currency = $request->input('currency', 'usd');
        
        $lineItems = [];
        foreach ($items as $item) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => $item['name'],
                        'images' => !empty($item['image_url']) ? [$item['image_url']] : [],
                    ],
                    'unit_amount' => (int) round($item['price'] * 100), // Stripe expects cents
                ],
                'quantity' => (int) $item['quantity'],
            ];
        }

        if (empty($lineItems)) {
            return response()->json(['error' => 'No items in cart'], 400);
        }

        try {
            $session = $stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                // Using absolute URLs for Stripe redirects
                'success_url' => route('tenant.checkout.success', [], true) . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('tenant.checkout.cancel', [], true),
                'metadata' => [
                    'tenant_id' => tenant('id'),
                    'customer_location' => $request->input('customer_location'),
                ],
            ]);

            return response()->json(['url' => $session->url]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show the success page.
     */
    public function success(Request $request)
    {
        $sessionId = $request->query('session_id');
        $sessionData = null;
        $orderId = null;

        if ($sessionId) {
            try {
                $stripe = new StripeClient(config('services.stripe.secret'));
                // Retrieve the session and expand line_items to show what was bought
                $sessionData = $stripe->checkout->sessions->retrieve($sessionId, [
                    'expand' => ['line_items'],
                ]);

                // Save order to database if it doesn't exist
                $order = Order::firstOrCreate(
                    ['stripe_session_id' => $sessionId],
                    [
                        'customer_id' => auth('customer')->id(), // If logged in
                        'status' => 'preparing',
                        'total_amount' => $sessionData->amount_total,
                        'currency' => $sessionData->currency,
                        'customer_location' => $sessionData->metadata->customer_location ?? null,
                    ]
                );

                $orderId = $order->id;

                // If the order was just created (wasRecentlyCreated), save the items
                if ($order->wasRecentlyCreated && isset($sessionData->line_items->data)) {
                    foreach ($sessionData->line_items->data as $item) {
                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_name' => $item->description,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->price->unit_amount,
                        ]);
                    }
                }

            } catch (\Exception $e) {
                // Silently fail if session can't be retrieved, page will still load
            }
        }

        return Inertia::render('tenant/checkout-success', [
            'sessionId' => $sessionId,
            'orderId' => $orderId,
            'session' => $sessionData,
            'tenant' => tenant(),
        ]);
    }

    /**
     * Show the cancel page.
     */
    public function cancel()
    {
        return Inertia::render('tenant/checkout-cancel', [
            'tenant' => tenant(),
        ]);
    }
}
