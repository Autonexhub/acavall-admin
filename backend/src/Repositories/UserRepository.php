<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class UserRepository extends BaseRepository
{
    protected string $table = 'users';

    /**
     * Find user by email
     *
     * @param string $email
     * @return array|null
     */
    public function findByEmail(string $email): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = :email LIMIT 1");
            $stmt->bindParam(':email', $email, PDO::PARAM_STR);
            $stmt->execute();

            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error in findByEmail: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verify password against hash
     *
     * @param string $password Plain text password
     * @param string $hash Password hash from database
     * @return bool
     */
    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Hash password
     *
     * @param string $password Plain text password
     * @return string
     */
    public function hashPassword(string $password): string
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    /**
     * Get user without password field
     *
     * @param array $user User data with password
     * @return array User data without password
     */
    public function sanitizeUser(array $user): array
    {
        unset($user['password_hash']);
        return $user;
    }
}
