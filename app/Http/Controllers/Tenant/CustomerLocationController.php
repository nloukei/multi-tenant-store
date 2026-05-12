<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomerLocationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'location' => 'required|string|max:500',
        ]);

        $customer = auth('customer')->user();
        if (!$customer) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $locations = $customer->saved_locations ?? [];
        $newLocation = trim($request->input('location'));

        if (!in_array($newLocation, $locations, true)) {
            $locations[] = $newLocation;
            $customer->saved_locations = $locations;
            $customer->save();
        }

        return redirect()->back()->with('message', 'Delivery location saved successfully.');
    }
}
