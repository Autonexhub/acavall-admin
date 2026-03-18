<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;
use App\Infrastructure\Database\Connection;

abstract class BaseRepository
{
    protected PDO $db;
    protected string $table;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    /**
     * Find all records
     *
     * @return array
     */
    public function findAll(): array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table}");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error in findAll: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Find record by ID
     *
     * @param int $id
     * @return array|null
     */
    public function findById(int $id): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error in findById: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create new record
     *
     * @param array $data
     * @return int|null Last insert ID or null on failure
     */
    public function create(array $data): ?int
    {
        try {
            $fields = array_keys($data);
            $values = array_values($data);

            $fieldsList = implode(', ', $fields);
            $placeholders = implode(', ', array_fill(0, count($fields), '?'));

            $sql = "INSERT INTO {$this->table} ({$fieldsList}) VALUES ({$placeholders})";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);

            return (int)$this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update record by ID
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        try {
            $fields = [];
            $values = [];

            foreach ($data as $key => $value) {
                $fields[] = "{$key} = ?";
                $values[] = $value;
            }

            $values[] = $id;
            $fieldsList = implode(', ', $fields);

            $sql = "UPDATE {$this->table} SET {$fieldsList} WHERE id = ?";
            $stmt = $this->db->prepare($sql);

            return $stmt->execute($values);
        } catch (PDOException $e) {
            error_log("Error in update: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete record by ID
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            return false;
        }
    }
}
