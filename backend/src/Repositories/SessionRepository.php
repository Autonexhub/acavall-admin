<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class SessionRepository extends BaseRepository
{
    protected string $table = 'sessions';

    /**
     * Find session with relations (center and therapists)
     *
     * @param int $id
     * @return array|null
     */
    public function findWithRelations(int $id): ?array
    {
        try {
            // Get session with center
            $stmt = $this->db->prepare("
                SELECT s.*, e.name as entity_name
                FROM sessions s
                LEFT JOIN entities e ON s.entity_id = e.id
                WHERE s.id = :id
                LIMIT 1
            ");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $session = $stmt->fetch();
            if (!$session) {
                return null;
            }

            // Get therapists
            $stmt = $this->db->prepare("
                SELECT t.*
                FROM therapists t
                INNER JOIN session_therapist st ON t.id = st.therapist_id
                WHERE st.session_id = :session_id
            ");
            $stmt->bindParam(':session_id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $session['therapists'] = $stmt->fetchAll();

            return $session;
        } catch (PDOException $e) {
            error_log("Error in findWithRelations: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Find sessions by date range with optional filters
     *
     * @param string $startDate
     * @param string $endDate
     * @param array $filters Optional filters (entity_id, project_id, therapist_id, program_id)
     * @return array
     */
    public function findByDateRange(string $startDate, string $endDate, array $filters = []): array
    {
        try {
            $sql = "
                SELECT
                    s.*,
                    e.name as entity_name
                FROM sessions s
                LEFT JOIN entities e ON s.entity_id = e.id
                WHERE s.date >= :start_date AND s.date <= :end_date
            ";

            $params = [
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ];

            if (!empty($filters['entity_id'])) {
                $sql .= " AND s.entity_id = :entity_id";
                $params[':entity_id'] = $filters['entity_id'];
            }

            if (!empty($filters['project_id'])) {
                $sql .= " AND s.project_id = :project_id";
                $params[':project_id'] = $filters['project_id'];
            }

            if (!empty($filters['therapist_id'])) {
                $sql .= " AND EXISTS (
                    SELECT 1 FROM session_therapist st
                    WHERE st.session_id = s.id AND st.therapist_id = :therapist_id
                )";
                $params[':therapist_id'] = $filters['therapist_id'];
            }

            $sql .= " ORDER BY s.date DESC, s.id DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $sessions = $stmt->fetchAll();

            error_log("SessionRepository: Found " . count($sessions) . " sessions");

            // Load therapists for each session
            foreach ($sessions as &$session) {
                $therapistStmt = $this->db->prepare("
                    SELECT t.*
                    FROM therapists t
                    INNER JOIN session_therapist st ON t.id = st.therapist_id
                    WHERE st.session_id = :session_id
                    ORDER BY t.name
                ");
                $therapistStmt->execute([':session_id' => $session['id']]);
                $session['therapists'] = $therapistStmt->fetchAll();
            }

            error_log("SessionRepository: Returning " . count($sessions) . " sessions with therapists");
            return $sessions;
        } catch (PDOException $e) {
            error_log("ERROR in findByDateRange: " . $e->getMessage());
            error_log("ERROR Stack trace: " . $e->getTraceAsString());
            return [];
        }
    }

    /**
     * Get statistics for sessions
     *
     * @param array $filters Optional filters (start_date, end_date, entity_id, program_id)
     * @return array Monthly stats
     */
    public function getStats(array $filters = []): array
    {
        try {
            $sql = "
                SELECT
                    DATE_FORMAT(s.date, '%Y-%m') as month,
                    COUNT(s.id) as session_count,
                    COALESCE(SUM(s.participants), 0) as total_participants,
                    COALESCE(SUM(s.hours), 0) as total_hours
                FROM sessions s
                WHERE 1=1
            ";

            $params = [];

            if (!empty($filters['start_date'])) {
                $sql .= " AND s.date >= :start_date";
                $params[':start_date'] = $filters['start_date'];
            }

            if (!empty($filters['end_date'])) {
                $sql .= " AND s.date <= :end_date";
                $params[':end_date'] = $filters['end_date'];
            }

            if (!empty($filters['entity_id'])) {
                $sql .= " AND s.entity_id = :entity_id";
                $params[':entity_id'] = $filters['entity_id'];
            }

            if (!empty($filters['program_id'])) {
                $sql .= " AND s.program_id = :program_id";
                $params[':program_id'] = $filters['program_id'];
            }

            $sql .= " GROUP BY month ORDER BY month DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error in getStats: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Attach therapists to session
     *
     * @param int $sessionId
     * @param array $therapistIds
     * @return bool
     */
    public function attachTherapists(int $sessionId, array $therapistIds): bool
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT IGNORE INTO session_therapist (session_id, therapist_id)
                VALUES (?, ?)
            ");

            foreach ($therapistIds as $therapistId) {
                $stmt->execute([$sessionId, $therapistId]);
            }

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error in attachTherapists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Detach therapists from session
     *
     * @param int $sessionId
     * @param array $therapistIds
     * @return bool
     */
    public function detachTherapists(int $sessionId, array $therapistIds): bool
    {
        try {
            if (empty($therapistIds)) {
                return true;
            }

            $placeholders = implode(',', array_fill(0, count($therapistIds), '?'));
            $sql = "DELETE FROM session_therapist WHERE session_id = ? AND therapist_id IN ($placeholders)";

            $stmt = $this->db->prepare($sql);
            $params = array_merge([$sessionId], $therapistIds);

            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error in detachTherapists: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Sync therapists for a session (replace all)
     *
     * @param int $sessionId
     * @param array $therapistIds
     * @return bool
     */
    public function syncTherapists(int $sessionId, array $therapistIds): bool
    {
        try {
            $this->db->beginTransaction();

            // Delete existing
            $stmt = $this->db->prepare("DELETE FROM session_therapist WHERE session_id = ?");
            $stmt->execute([$sessionId]);

            // Insert new
            if (!empty($therapistIds)) {
                $stmt = $this->db->prepare("
                    INSERT INTO session_therapist (session_id, therapist_id)
                    VALUES (?, ?)
                ");

                foreach ($therapistIds as $therapistId) {
                    $stmt->execute([$sessionId, $therapistId]);
                }
            }

            $this->db->commit();
            return true;
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Error in syncTherapists: " . $e->getMessage());
            return false;
        }
    }
}
