<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Tenant;

class ProductStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tenant = Tenant::findOrFail($this->route('tenant'));
        $user = $this->user();
        
        return $user->isSuperAdmin() || $tenant->user_id === $user->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_at_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120',
            'category_id' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    $tenant = Tenant::findOrFail($this->route('tenant'));
                    $exists = \Illuminate\Support\Facades\DB::table("{$tenant->tenancy_db_name}.categories")
                        ->where('id', $value)
                        ->exists();
                        
                    if (!$exists) {
                        $fail('The selected category is invalid.');
                    }
                }
            ],
        ];
    }
}
