<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class StoreCreateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'store_name' => ['required', 'string', 'max:255'],
            'subdomain' => [
                'required',
                'string',
                'min:3',
                'max:63',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('tenants', 'id'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $fullDomain = $value.'.localhost';
                    if (DB::table('domains')->where('domain', $fullDomain)->exists()) {
                        $fail('The subdomain has already been taken.');
                    }
                },
            ],
            'primary_color' => ['nullable', 'regex:/^#([0-9A-Fa-f]{6})$/'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'banner_text' => ['nullable', 'string', 'max:500'],
            'currency' => ['nullable', 'string', 'size:3'],
        ];
    }
}
