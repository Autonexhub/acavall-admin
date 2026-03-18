<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class EntityRepository extends BaseRepository
{
    protected string $table = 'entities';

    /**
     * Search entities with pagination
     *
     * @param string|null $search
     * @param int $page
     * @param int $perPage
     * @return array
     */
    public function searchWithPagination(?string $search = null, int $page = 1, int $perPage = 18): array
    {
        try {
            $offset = ($page - 1) * $perPage;

            $whereClause = "WHERE is_active = 1";
            $params = [];

            if ($search) {
                $whereClause .= " AND (
                    name LIKE :search1
                    OR contact_person LIKE :search2
                    OR email LIKE :search3
                    OR phone LIKE :search4
                )";
                $searchTerm = "%{$search}%";
                $params[':search1'] = $searchTerm;
                $params[':search2'] = $searchTerm;
                $params[':search3'] = $searchTerm;
                $params[':search4'] = $searchTerm;
            }

            // Get total count
            $countStmt = $this->db->prepare("
                SELECT COUNT(*) as total
                FROM {$this->table}
                {$whereClause}
            ");

            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }

            $countStmt->execute();
            $total = (int)$countStmt->fetch()['total'];

            // Get paginated results
            $stmt = $this->db->prepare("
                SELECT *
                FROM {$this->table}
                {$whereClause}
                ORDER BY name ASC
                LIMIT :limit OFFSET :offset
            ");

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return [
                'data' => $stmt->fetchAll(),
                'pagination' => [
                    'total' => $total,
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => (int)ceil($total / $perPage),
                    'from' => $total > 0 ? $offset + 1 : 0,
                    'to' => min($offset + $perPage, $total)
                ]
            ];
        } catch (PDOException $e) {
            error_log("Error in searchWithPagination: " . $e->getMessage());
            return [
                'data' => [],
                'pagination' => [
                    'total' => 0,
                    'per_page' => $perPage,
                    'current_page' => 1,
                    'last_page' => 0,
                    'from' => 0,
                    'to' => 0
                ]
            ];
        }
    }
}
