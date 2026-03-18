<?php

declare(strict_types=1);

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JWTService
{
    private string $secret;
    private string $issuer;
    private int $expiration;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'] ?? 'your-secret-key';
        $this->issuer = $_ENV['JWT_ISSUER'] ?? 'acavall-harmony';
        $this->expiration = (int)($_ENV['JWT_EXPIRATION'] ?? 3600);
    }

    /**
     * Generate JWT token for a user
     *
     * @param array $user User data
     * @return string JWT token
     */
    public function generateToken(array $user): string
    {
        $issuedAt = time();
        $expiresAt = $issuedAt + $this->expiration;

        $payload = [
            'iss' => $this->issuer,
            'iat' => $issuedAt,
            'exp' => $expiresAt,
            'sub' => $user['id'],
            'data' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
            ]
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    /**
     * Validate and decode JWT token
     *
     * @param string $token JWT token
     * @return object Decoded token payload
     * @throws Exception
     */
    public function validateToken(string $token): object
    {
        try {
            return JWT::decode($token, new Key($this->secret, 'HS256'));
        } catch (Exception $e) {
            error_log("JWT validation failed: " . $e->getMessage());
            throw new Exception("Invalid or expired token");
        }
    }

    /**
     * Extract token from Authorization header
     *
     * @param string|null $authHeader Authorization header value
     * @return string|null Token or null if not found
     */
    public function extractTokenFromHeader(?string $authHeader): ?string
    {
        if (!$authHeader) {
            return null;
        }

        // Remove "Bearer " prefix
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
