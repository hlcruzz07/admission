<?php

namespace App\Services;

class HashingService
{
    public function hashValue(?string $value): ?string
    {
        if (is_null($value) || $value === '') {
            return null;
        }

        return hash('sha256', $value);
    }

    public function appendHashValues(array $data, $exclude = [])
    {
        $processedData = [];

        $exclude = is_array($exclude) ? $exclude : [$exclude];

        foreach ($data as $key => $value) {

            $processedData[$key] = $value;

            // ✅ skip excluded keys
            if (in_array($key, $exclude)) {
                continue;
            }

            // ✅ skip booleans
            if (is_bool($value)) {
                continue;
            }

            // 🔥 FIX: skip arrays & objects
            if (!is_string($value) && !is_null($value)) {
                continue;
            }

            $processedData[$key . '_hash'] = $this->hashValue($value);
        }

        return $processedData;
    }
}
