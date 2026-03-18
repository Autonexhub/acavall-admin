<?php

declare(strict_types=1);

namespace App\Repositories;

use PDO;
use PDOException;

class ProjectRepository extends BaseRepository
{
    protected string $table = 'projects';

    /**
     * Get all projects with assigned entities
     *
     * @return array
     */
    public function findAllWithEntities(): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    p.*,
                    GROUP_CONCAT(e.id) as entity_ids,
                    GROUP_CONCAT(e.name) as entity_names,
                    GROUP_CONCAT(e.color) as entity_colors
                FROM {$this->table} p
                LEFT JOIN project_entities pe ON p.id = pe.project_id
                LEFT JOIN entities e ON pe.entity_id = e.id
                WHERE p.is_active = 1
                GROUP BY p.id
                ORDER BY p.created_at DESC
            ");
            $stmt->execute();

            $projects = $stmt->fetchAll();

            // Format entities as arrays
            foreach ($projects as &$project) {
                if ($project['entity_ids']) {
                    $entityIds = explode(',', $project['entity_ids']);
                    $entityNames = explode(',', $project['entity_names']);
                    $entityColors = explode(',', $project['entity_colors']);
                    $project['entities'] = array_map(function($id, $name, $color) {
                        return ['id' => (int)$id, 'name' => $name, 'color' => $color];
                    }, $entityIds, $entityNames, $entityColors);
                } else {
                    $project['entities'] = [];
                }
                unset($project['entity_ids']);
                unset($project['entity_names']);
                unset($project['entity_colors']);
            }

            return $projects;
        } catch (PDOException $e) {
            error_log("Error in findAllWithEntities: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Find project by ID with entities
     *
     * @param int $id
     * @return array|null
     */
    public function findWithEntities(int $id): ?array
    {
        try {
            $project = $this->findById($id);
            if (!$project) {
                return null;
            }

            // Get assigned entities
            $stmt = $this->db->prepare("
                SELECT e.*
                FROM entities e
                INNER JOIN project_entities pe ON e.id = pe.entity_id
                WHERE pe.project_id = :project_id
                ORDER BY e.name
            ");
            $stmt->bindParam(':project_id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $project['entities'] = $stmt->fetchAll();

            return $project;
        } catch (PDOException $e) {
            error_log("Error in findWithEntities: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Attach entities to a project
     *
     * @param int $projectId
     * @param array $entityIds
     * @return bool
     */
    public function attachEntities(int $projectId, array $entityIds): bool
    {
        try {
            $stmt = $this->db->prepare("
                INSERT IGNORE INTO project_entities (project_id, entity_id)
                VALUES (:project_id, :entity_id)
            ");

            foreach ($entityIds as $entityId) {
                $stmt->execute([
                    ':project_id' => $projectId,
                    ':entity_id' => $entityId
                ]);
            }

            return true;
        } catch (PDOException $e) {
            error_log("Error in attachEntities: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Detach entities from a project
     *
     * @param int $projectId
     * @param array $entityIds
     * @return bool
     */
    public function detachEntities(int $projectId, array $entityIds): bool
    {
        try {
            $placeholders = implode(',', array_fill(0, count($entityIds), '?'));
            $stmt = $this->db->prepare("
                DELETE FROM project_entities
                WHERE project_id = ? AND entity_id IN ($placeholders)
            ");

            $params = array_merge([$projectId], $entityIds);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error in detachEntities: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete project
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        try {
            // Soft delete
            $stmt = $this->db->prepare("UPDATE {$this->table} SET is_active = 0 WHERE id = :id");
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error in delete: " . $e->getMessage());
            return false;
        }
    }
}
