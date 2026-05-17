<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeAndValidateInput
{
    /**
     * Fields that should skip raw HTML tag sanitization (e.g., passwords or tokens).
     */
    protected array $skipSanitization = [
        'password',
        'password_confirmation',
        'current_password',
        'new_password',
        'token',
        'stripe_token',
        'card_token',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Reject oversized requests (e.g., total payload > 10MB)
        $contentLength = $request->header('Content-Length');
        if ($contentLength && $contentLength > 10 * 1024 * 1024) { // 10MB
            return response()->json(['error' => 'Payload Too Large (Maximum 10MB allowed)'], 413);
        }

        // 2. Validate malformed JSON
        if ($request->isJson()) {
            $json = $request->getContent();
            if (!empty($json)) {
                json_decode($json);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return response()->json(['error' => 'Malformed JSON payload'], 400);
                }
            }
        }

        // 3. Recursive Sanitize & Check Oversized values
        $inputs = $request->all();
        try {
            $sanitized = $this->sanitizeAndCheck($inputs);
            $request->merge($sanitized);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return $next($request);
    }

    /**
     * Recursively sanitize strings and check for oversized values or deep nesting.
     */
    protected function sanitizeAndCheck(array $data, int $depth = 0): array
    {
        if ($depth > 10) { // Limit depth to prevent nested attacks/stack overflow
            throw new \InvalidArgumentException('Excessive array nesting level detected.');
        }

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->sanitizeAndCheck($value, $depth + 1);
            } elseif (is_string($value)) {
                // Reject excessively long fields (> 128KB) to prevent resource exhaustion / buffer overflow attempts
                if (strlen($value) > 128 * 1024) {
                    throw new \InvalidArgumentException("Input field '{$key}' exceeds maximum permitted length.");
                }

                // Sanitize string to prevent XSS (strip HTML tags, except for sensitive/skipped keys)
                if (!in_array($key, $this->skipSanitization, true)) {
                    $data[$key] = strip_tags($value);
                }
            }
        }

        return $data;
    }
}
