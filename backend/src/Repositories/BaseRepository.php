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
     * @throws PDOException
     */
    public function create(array $data): ?int
    {
        try {
            $fields = array_keys($data);
            $values = array_values($data);

            $fieldsList = implode(', ', $fields);
            $placeholders = implode(', ', array_fill(0, count($fields), '?'));

            $sql = "INSERT INTO {$this->table} ({$fieldsList}) VALUES ({$placeholders})";

            error_log("BaseRepository::create - Table: {$this->table}");
            error_log("BaseRepository::create - SQL: {$sql}");
            error_log("BaseRepository::create - Fields: " . json_encode($fields));

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute($values);

            if (!$result) {
                $errorInfo = $stmt->errorInfo();
                error_log("BaseRepository::create - Execute failed. Error info: " . json_encode($errorInfo));
                return null;
            }

            $lastId = (int)$this->db->lastInsertId();
            error_log("BaseRepository::create - Success. Last insert ID: {$lastId}");

            return $lastId;
        } catch (PDOException $e) {
            error_log("BaseRepository::create - PDOException: " . $e->getMessage());
            error_log("BaseRepository::create - SQL State: " . $e->getCode());
            error_log("BaseRepository::create - Table: {$this->table}");
            // Re-throw so controllers can handle with proper error messages
            throw $e;
        }
    }

    /**
     * Update record by ID
     *
     * @param int $id
     * @param array $data
     * @return bool
     * @throws PDOException
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

            error_log("BaseRepository::update - Table: {$this->table}, ID: {$id}");
            error_log("BaseRepository::update - SQL: {$sql}");
            error_log("BaseRepository::update - Fields: " . json_encode(array_keys($data)));

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute($values);

            if (!$result) {
                $errorInfo = $stmt->errorInfo();
                error_log("BaseRepository::update - Execute failed. Error info: " . json_encode($errorInfo));
            } else {
                error_log("BaseRepository::update - Success. Rows affected: " . $stmt->rowCount());
            }

            return $result;
        } catch (PDOException $e) {
            error_log("BaseRepository::update - PDOException: " . $e->getMessage());
            error_log("BaseRepository::update - SQL State: " . $e->getCode());
            throw $e;
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
