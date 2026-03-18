<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class TherapistRepository extends BaseRepository
{
    protected string $table = 'therapists';

    /**
     * Find therapist with work history and assigned entities
     *
     * @param int $id
     * @return array|null
     */
    public function findWithWorkHistory(int $id): ?array
    {
        try {
            // Get therapist
            $therapist = $this->findById($id);
            if (!$therapist) {
                return null;
            }

            // Get work history
            $stmt = $this->db->prepare("
                SELECT wh.*, e.name as entity_name, e.city, e.province
                FROM staff_work_history wh
                LEFT JOIN entities e ON wh.entity_id = e.id
                WHERE wh.therapist_id = :therapist_id
                ORDER BY wh.start_date DESC
            ");
            $stmt->bindParam(':therapist_id', $id, PDO::PARAM_INT);

            try {
                $stmt->execute();
                $therapist['work_history'] = $stmt->fetchAll();
            } catch (PDOException $e) {
                // Table might not exist yet
                $therapist['work_history'] = [];
            }

            // Get assigned entities
            $stmt = $this->db->prepare("
                SELECT e.*
                FROM entities e
                INNER JOIN entity_therapist et ON e.id = et.entity_id
                WHERE et.therapist_id = :therapist_id
                ORDER BY e.name
            ");
            $stmt->bindParam(':therapist_id', $id, PDO::PARAM_INT);

            try {
                $stmt->execute();
                $therapist['entities'] = $stmt->fetchAll();
            } catch (PDOException $e) {
                // Table might not exist yet
                $therapist['entities'] = [];
            }

            return $therapist;
        } catch (PDOException $e) {
            error_log("Error in findWithWorkHistory: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get hours worked by therapist
     *
     * @param int $therapistId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return float
     */
    public function getHoursWorked(int $therapistId, ?string $startDate = null, ?string $endDate = null): float
    {
        try {
            $sql = "
                SELECT COALESCE(SUM(s.hours), 0) as total_hours
                FROM sessions s
                INNER JOIN session_therapist st ON s.id = st.session_id
                WHERE st.therapist_id = :therapist_id
            ";

            $params = [':therapist_id' => $therapistId];

            if ($startDate) {
                $sql .= " AND s.date >= :start_date";
                $params[':start_date'] = $startDate;
            }

            if ($endDate) {
                $sql .= " AND s.date <= :end_date";
                $params[':end_date'] = $endDate;
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $result = $stmt->fetch();
            return (float)($result['total_hours'] ?? 0);
        } catch (PDOException $e) {
            error_log("Error in getHoursWorked: " . $e->getMessage());
            return 0.0;
        }
    }

    /**
     * Attach centers to therapist
     *
     * @param int $therapistId
     * @param array $centerIds
     * @return bool
     */
    public function attachEntities(int $therapistId, array $centerIds): bool
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT IGNORE INTO entity_therapist (entity_id, therapist_id)
                VALUES (?, ?)
            ");

            foreach ($centerIds as $centerId) {
                $stmt->execute([$centerId, $therapistId]);
            }

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error in attachEntities: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Detach centers from therapist
     *
     * @param int $therapistId
     * @param array $centerIds
     * @return bool
     */
    public function detachEntities(int $therapistId, array $centerIds): bool
    {
        try {
            if (empty($centerIds)) {
                return true;
            }

            $placeholders = implode(',', array_fill(0, count($centerIds), '?'));
            $sql = "DELETE FROM entity_therapist WHERE therapist_id = ? AND entity_id IN ($placeholders)";

            $stmt = $this->db->prepare($sql);
            $params = array_merge([$therapistId], $centerIds);

            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error in detachEntities: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all therapists with session counts and assigned entities
     *
     * @return array
     */
    public function findAllWithCounts(): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    t.*,
                    COUNT(DISTINCT st.session_id) as session_count,
                    COALESCE(SUM(s.hours), 0) as hoursWorked
                FROM therapists t
                LEFT JOIN session_therapist st ON t.id = st.therapist_id
                LEFT JOIN sessions s ON st.session_id = s.id
                GROUP BY t.id
                ORDER BY t.name
            ");
            $stmt->execute();
            $therapists = $stmt->fetchAll();

            // Get entities for each therapist
            foreach ($therapists as &$therapist) {
                $stmt = $this->db->prepare("
                    SELECT e.id, e.name, e.color
                    FROM entities e
                    INNER JOIN entity_therapist et ON e.id = et.entity_id
                    WHERE et.therapist_id = :therapist_id
                    ORDER BY e.name
                ");
                $stmt->execute([':therapist_id' => $therapist['id']]);
                $therapist['entities'] = $stmt->fetchAll();
            }

            return $therapists;
        } catch (PDOException $e) {
            error_log("Error in findAllWithCounts: " . $e->getMessage());
            error_log("SQL Error: " . $e->getMessage());
            return [];
        }
    }
}
