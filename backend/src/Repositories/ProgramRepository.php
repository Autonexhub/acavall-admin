<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class ProgramRepository extends BaseRepository
{
    protected string $table = 'programs';

    /**
     * Get all programs with session statistics
     *
     * @return array
     */
    public function findAllWithStats(): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    p.*,
                    COUNT(s.id) as session_count,
                    COALESCE(SUM(s.participants), 0) as total_participants,
                    COALESCE(SUM(s.hours), 0) as total_hours
                FROM programs p
                LEFT JOIN sessions s ON p.id = s.program_id
                GROUP BY p.id
                ORDER BY p.name
            ");
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error in findAllWithStats: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get program statistics
     *
     * @param int $programId
     * @param array $filters Optional filters (start_date, end_date)
     * @return array|null
     */
    public function getStats(int $programId, array $filters = []): ?array
    {
        try {
            $sql = "
                SELECT
                    COUNT(s.id) as session_count,
                    COALESCE(SUM(s.participants), 0) as total_participants,
                    COALESCE(SUM(s.hours), 0) as total_hours,
                    COUNT(DISTINCT s.entity_id) as entity_count,
                    COUNT(DISTINCT st.therapist_id) as therapist_count
                FROM sessions s
                LEFT JOIN session_therapist st ON s.id = st.session_id
                WHERE s.program_id = :program_id
            ";

            $params = [':program_id' => $programId];

            if (!empty($filters['start_date'])) {
                $sql .= " AND s.date >= :start_date";
                $params[':start_date'] = $filters['start_date'];
            }

            if (!empty($filters['end_date'])) {
                $sql .= " AND s.date <= :end_date";
                $params[':end_date'] = $filters['end_date'];
            }

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetch();
        } catch (PDOException $e) {
            error_log("Error in getStats: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Find program by name
     *
     * @param string $name
     * @return array|null
     */
    public function findByName(string $name): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE name = :name LIMIT 1");
            $stmt->bindParam(':name', $name, PDO::PARAM_STR);
            $stmt->execute();

            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Error in findByName: " . $e->getMessage());
            return null;
        }
    }
}
