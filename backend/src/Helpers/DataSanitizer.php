<?php

declare(strict_types=1);

namespace App\Helpers;

/**
 * Helper class to sanitize input data before storing in database
 */
class DataSanitizer
{
    /**
     * Sanitize a date value - returns null for empty/invalid dates
     */
    public static function date(?string $value): ?string
    {
        if ($value === null || $value === '' || $value === '0000-00-00') {
            return null;
        }

        // Validate date format (YYYY-MM-DD)
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            $parts = explode('-', $value);
            if (checkdate((int)$parts[1], (int)$parts[2], (int)$parts[0])) {
                return $value;
            }
        }

        return null;
    }

    /**
     * Sanitize a datetime/timestamp value
     */
    public static function datetime(?string $value): ?string
    {
        if ($value === null || $value === '' || str_starts_with($value, '0000-00-00')) {
            return null;
        }

        // Try to parse the datetime
        $timestamp = strtotime($value);
        if ($timestamp === false) {
            return null;
        }

        return date('Y-m-d H:i:s', $timestamp);
    }

    /**
     * Sanitize a time value (HH:MM or HH:MM:SS)
     */
    public static function time(?string $value): ?string
    {
        if ($value === null || $value === '' || $value === '00:00:00') {
            return null;
        }

        if (preg_match('/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/', $value)) {
            return $value;
        }

        return null;
    }

    /**
     * Sanitize a string value - returns null for empty strings
     */
    public static function string(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        return trim($value);
    }

    /**
     * Sanitize a URL value - returns null for empty/invalid URLs
     */
    public static function url(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        // Basic URL validation
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        return null;
    }

    /**
     * Sanitize an integer value - returns default for empty/invalid
     */
    public static function int($value, int $default = 0): int
    {
        if ($value === null || $value === '') {
            return $default;
        }

        return (int)$value;
    }

    /**
     * Sanitize a float value - returns null for empty, default otherwise
     */
    public static function float($value, ?float $default = null): ?float
    {
        if ($value === null || $value === '') {
            return $default;
        }

        return (float)$value;
    }

    /**
     * Sanitize an email value
     */
    public static function email(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return $value;
        }

        return null;
    }

    /**
     * Sanitize an enum value - returns default if not in allowed list
     */
    public static function enum(?string $value, array $allowed, string $default): string
    {
        if ($value === null || $value === '' || !in_array($value, $allowed, true)) {
            return $default;
        }

        return $value;
    }
}
