<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Tenant;

class StoreUpdateRequest extends FormRequest
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
            'store_name' => 'required|string|max:255',
            'primary_color' => ['nullable', 'regex:/^#([0-9A-Fa-f]{6})$/'],
            'banner_text' => ['nullable', 'string', 'max:500'],
            'logo_file' => 'nullable|image|max:2048',
            'banner_images.*' => 'nullable|image|max:5120',
            'delete_banners' => 'nullable|array',
            'currency' => 'nullable|string|size:3',
            'hero_title' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string|max:500',
            'hero_button_text' => 'nullable|string|max:100',
            'hero_button_link' => 'nullable|string|max:255',
            'hero_alignment' => 'nullable|in:left,center,right',
        ];
    }
}
