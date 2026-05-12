<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Tenant;

class CategoryStoreRequest extends FormRequest
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
            'name' => [
                'required', 
                'string', 
                'max:255',
                function ($attribute, $value, $fail) {
                    $tenant = Tenant::findOrFail($this->route('tenant'));
                    $exists = \Illuminate\Support\Facades\DB::table("{$tenant->tenancy_db_name}.categories")
                        ->where('name', 'ilike', $value)
                        ->exists();
                        
                    if ($exists) {
                        $fail('A category with this name already exists in your store.');
                    }
                }
            ],
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                function ($attribute, $value, $fail) {
                    $tenant = Tenant::findOrFail($this->route('tenant'));
                    $exists = \Illuminate\Support\Facades\DB::table("{$tenant->tenancy_db_name}.categories")
                        ->where('id', $value)
                        ->exists();
                        
                    if (!$exists) {
                        $fail('The selected parent category is invalid.');
                    }
                }
            ],
        ];
    }
}
