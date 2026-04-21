<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\ProjectRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProjectController
{
    private ProjectRepository $projectRepository;

    public function __construct()
    {
        $this->projectRepository = new ProjectRepository();
    }

    /**
     * List all projects
     * GET /api/projects
     */
    public function list(Request $request, Response $response): Response
    {
        try {
            $projects = $this->projectRepository->findAllWithEntities();

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $projects
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProjectController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch projects'
            ], 500);
        }
    }

    /**
     * Get single project
     * GET /api/projects/:id
     */
    public function get(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $project = $this->projectRepository->findWithEntities($id);

            if (!$project) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Project not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $project
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProjectController::get - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch project'
            ], 500);
        }
    }

    /**
     * Create new project
     * POST /api/projects
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $body = $request->getParsedBody();

            if (empty($body['name'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Name is required'
                ], 400);
            }

            $data = [
                'name' => $body['name'],
                'description' => $body['description'] ?? null,
                'start_date' => $body['start_date'] ?? null,
                'end_date' => $body['end_date'] ?? null,
                'num_sessions' => isset($body['num_sessions']) ? (int)$body['num_sessions'] : 0,
                'beneficiaries' => isset($body['beneficiaries']) ? (int)$body['beneficiaries'] : 0,
                'beneficiaries_female' => isset($body['beneficiaries_female']) ? (int)$body['beneficiaries_female'] : 0,
                'beneficiaries_male' => isset($body['beneficiaries_male']) ? (int)$body['beneficiaries_male'] : 0,
                'average_age' => isset($body['average_age']) && $body['average_age'] !== '' ? (float)$body['average_age'] : null,
                'amount' => isset($body['amount']) ? (float)$body['amount'] : 0,
                'type' => $body['type'] ?? 'terapia',
                'funding_type' => $body['funding_type'] ?? 'private_subsidy',
                'beneficiary_type' => $body['beneficiary_type'] ?? 'otros',
                'budget_link' => $body['budget_link'] ?? null,
                'notes' => $body['notes'] ?? null,
            ];

            $id = $this->projectRepository->create($data);

            if (!$id) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to create project'
                ], 500);
            }

            // Attach entities if provided
            if (!empty($body['entity_ids']) && is_array($body['entity_ids'])) {
                $this->projectRepository->attachEntities($id, $body['entity_ids']);
            }

            $project = $this->projectRepository->findWithEntities($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $project
            ], 201);
        } catch (\Exception $e) {
            error_log("Error in ProjectController::create - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to create project'
            ], 500);
        }
    }

    /**
     * Update project
     * PUT /api/projects/:id
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $body = $request->getParsedBody();

            $project = $this->projectRepository->findById($id);
            if (!$project) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Project not found'
                ], 404);
            }

            $data = [];
            if (isset($body['name'])) $data['name'] = $body['name'];
            if (isset($body['description'])) $data['description'] = $body['description'];
            if (isset($body['start_date'])) $data['start_date'] = $body['start_date'];
            if (isset($body['end_date'])) $data['end_date'] = $body['end_date'];
            if (isset($body['num_sessions'])) $data['num_sessions'] = (int)$body['num_sessions'];
            if (isset($body['beneficiaries'])) $data['beneficiaries'] = (int)$body['beneficiaries'];
            if (isset($body['beneficiaries_female'])) $data['beneficiaries_female'] = (int)$body['beneficiaries_female'];
            if (isset($body['beneficiaries_male'])) $data['beneficiaries_male'] = (int)$body['beneficiaries_male'];
            if (array_key_exists('average_age', $body)) $data['average_age'] = $body['average_age'] !== '' && $body['average_age'] !== null ? (float)$body['average_age'] : null;
            if (isset($body['amount'])) $data['amount'] = (float)$body['amount'];
            if (isset($body['type'])) $data['type'] = $body['type'];
            if (isset($body['funding_type'])) $data['funding_type'] = $body['funding_type'];
            if (isset($body['beneficiary_type'])) $data['beneficiary_type'] = $body['beneficiary_type'];
            if (isset($body['budget_link'])) $data['budget_link'] = $body['budget_link'];
            if (isset($body['notes'])) $data['notes'] = $body['notes'];

            if (!empty($data)) {
                $success = $this->projectRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to update project'
                    ], 500);
                }
            }

            // Update entities if provided
            if (isset($body['entity_ids']) && is_array($body['entity_ids'])) {
                $currentProject = $this->projectRepository->findWithEntities($id);
                $currentEntityIds = array_map(fn($c) => $c['id'], $currentProject['centers'] ?? []);
                $newEntityIds = $body['entity_ids'];

                $toDetach = array_diff($currentEntityIds, $newEntityIds);
                $toAttach = array_diff($newEntityIds, $currentEntityIds);

                if (!empty($toDetach)) {
                    $this->projectRepository->detachEntities($id, $toDetach);
                }
                if (!empty($toAttach)) {
                    $this->projectRepository->attachEntities($id, $toAttach);
                }
            }

            $updatedProject = $this->projectRepository->findWithEntities($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $updatedProject
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProjectController::update - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to update project'
            ], 500);
        }
    }

    /**
     * Delete project
     * DELETE /api/projects/:id
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];

            $project = $this->projectRepository->findById($id);
            if (!$project) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Project not found'
                ], 404);
            }

            $success = $this->projectRepository->delete($id);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to delete project'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Project deleted successfully'
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProjectController::delete - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to delete project'
            ], 500);
        }
    }

    private function jsonResponse(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
