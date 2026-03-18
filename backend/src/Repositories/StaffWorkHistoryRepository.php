<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class StaffWorkHistoryRepository extends BaseRepository
{
    protected string $table = 'staff_work_history';

    /**
     * Get work history for a therapist with entity details
     *
     * @param int $therapistId
     * @return array
     */
    public function findByTherapistId(int $therapistId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    swh.*,
                    e.name as entity_name,
                    e.city,
                    e.province
                FROM {$this->table} swh
                LEFT JOIN entities e ON swh.entity_id = e.id
                WHERE swh.therapist_id = :therapist_id
                ORDER BY
                    CASE WHEN swh.end_date IS NULL THEN 0 ELSE 1 END,
                    swh.start_date DESC
            ");
            $stmt->bindParam(':therapist_id', $therapistId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error in findByTherapistId: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Create work history entry
     *
     * @param array $data
     * @return int|null
     */
    public function create(array $data): ?int
    {
        try {
            $fields = ['therapist_id', 'entity_id', 'role', 'start_date'];
            $values = [':therapist_id', ':entity_id', ':role', ':start_date'];
            $params = [
                ':therapist_id' => $data['therapist_id'],
                ':entity_id' => $data['entity_id'],
                ':role' => $data['role'],
                ':start_date' => $data['start_date'],
            ];

            if (isset($data['end_date'])) {
                $fields[] = 'end_date';
                $values[] = ':end_date';
                $params[':end_date'] = $data['end_date'];
            }

            if (isset($data['notes'])) {
                $fields[] = 'notes';
                $values[] = ':notes';
                $params[':notes'] = $data['notes'];
            }

            $sql = "INSERT INTO {$this->table} (" . implode(', ', $fields) . ")
                    VALUES (" . implode(', ', $values) . ")";

            $stmt = $this->db->prepare($sql);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            return (int)$this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("Error in create: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Update work history entry
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        try {
            $fields = [];
            $params = [':id' => $id];

            if (isset($data['entity_id'])) {
                $fields[] = 'entity_id = :entity_id';
                $params[':entity_id'] = $data['entity_id'];
            }

            if (isset($data['role'])) {
                $fields[] = 'role = :role';
                $params[':role'] = $data['role'];
            }

            if (isset($data['start_date'])) {
                $fields[] = 'start_date = :start_date';
                $params[':start_date'] = $data['start_date'];
            }

            if (isset($data['end_date'])) {
                $fields[] = 'end_date = :end_date';
                $params[':end_date'] = $data['end_date'];
            }

            if (isset($data['notes'])) {
                $fields[] = 'notes = :notes';
                $params[':notes'] = $data['notes'];
            }

            if (empty($fields)) {
                return true;
            }

            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in update: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete work history entry
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
