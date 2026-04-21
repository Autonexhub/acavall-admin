<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\ProjectRepository;
use App\Helpers\DataSanitizer;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProjectController
{
    private ProjectRepository $projectRepository;

    private const PROJECT_TYPES = ['ocio', 'educacion', 'terapia', 'voluntariado', 'formacion', 'otros'];
    private const FUNDING_TYPES = ['public_subsidy', 'private_subsidy', 'financiacion_propia'];
    private const BENEFICIARY_TYPES = [
        'discapacidad_sensorial', 'discapacidad_intelectual', 'discapacidad_fisica_organica',
        'discapacidad_psicosocial', 'personas_mayores', 'mujeres_victimas_violencia',
        'menores_riesgo', 'infancia_juventud', 'cuidadores_familias', 'otros'
    ];

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
                'name' => DataSanitizer::string($body['name']),
                'description' => DataSanitizer::string($body['description'] ?? null),
                'start_date' => DataSanitizer::date($body['start_date'] ?? null),
                'end_date' => DataSanitizer::date($body['end_date'] ?? null),
                'num_sessions' => DataSanitizer::int($body['num_sessions'] ?? null, 0),
                'beneficiaries' => DataSanitizer::int($body['beneficiaries'] ?? null, 0),
                'beneficiaries_female' => DataSanitizer::int($body['beneficiaries_female'] ?? null, 0),
                'beneficiaries_male' => DataSanitizer::int($body['beneficiaries_male'] ?? null, 0),
                'average_age' => DataSanitizer::float($body['average_age'] ?? null),
                'amount' => DataSanitizer::float($body['amount'] ?? null, 0.0),
                'type' => DataSanitizer::enum($body['type'] ?? null, self::PROJECT_TYPES, 'terapia'),
                'funding_type' => DataSanitizer::enum($body['funding_type'] ?? null, self::FUNDING_TYPES, 'private_subsidy'),
                'beneficiary_type' => DataSanitizer::enum($body['beneficiary_type'] ?? null, self::BENEFICIARY_TYPES, 'otros'),
                'budget_number' => DataSanitizer::string($body['budget_number'] ?? null),
                'budget_link' => DataSanitizer::url($body['budget_link'] ?? null),
                'notes' => DataSanitizer::string($body['notes'] ?? null),
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
            if (isset($body['name'])) $data['name'] = DataSanitizer::string($body['name']);
            if (array_key_exists('description', $body)) $data['description'] = DataSanitizer::string($body['description']);
            if (array_key_exists('start_date', $body)) $data['start_date'] = DataSanitizer::date($body['start_date']);
            if (array_key_exists('end_date', $body)) $data['end_date'] = DataSanitizer::date($body['end_date']);
            if (isset($body['num_sessions'])) $data['num_sessions'] = DataSanitizer::int($body['num_sessions'], 0);
            if (isset($body['beneficiaries'])) $data['beneficiaries'] = DataSanitizer::int($body['beneficiaries'], 0);
            if (isset($body['beneficiaries_female'])) $data['beneficiaries_female'] = DataSanitizer::int($body['beneficiaries_female'], 0);
            if (isset($body['beneficiaries_male'])) $data['beneficiaries_male'] = DataSanitizer::int($body['beneficiaries_male'], 0);
            if (array_key_exists('average_age', $body)) $data['average_age'] = DataSanitizer::float($body['average_age']);
            if (isset($body['amount'])) $data['amount'] = DataSanitizer::float($body['amount'], 0.0);
            if (isset($body['type'])) $data['type'] = DataSanitizer::enum($body['type'], self::PROJECT_TYPES, 'terapia');
            if (isset($body['funding_type'])) $data['funding_type'] = DataSanitizer::enum($body['funding_type'], self::FUNDING_TYPES, 'private_subsidy');
            if (isset($body['beneficiary_type'])) $data['beneficiary_type'] = DataSanitizer::enum($body['beneficiary_type'], self::BENEFICIARY_TYPES, 'otros');
            if (array_key_exists('budget_number', $body)) $data['budget_number'] = DataSanitizer::string($body['budget_number']);
            if (array_key_exists('budget_link', $body)) $data['budget_link'] = DataSanitizer::url($body['budget_link']);
            if (array_key_exists('notes', $body)) $data['notes'] = DataSanitizer::string($body['notes']);

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
