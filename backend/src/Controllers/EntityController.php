<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\EntityRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class EntityController
{
    private EntityRepository $entityRepository;

    public function __construct()
    {
        $this->entityRepository = new EntityRepository();
    }

    /**
     * List all entities with search and pagination
     * GET /api/entities
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function list(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();
            $search = $params['search'] ?? null;
            $page = isset($params['page']) ? (int)$params['page'] : 1;
            $perPage = isset($params['per_page']) ? (int)$params['per_page'] : 18;

            $result = $this->entityRepository->searchWithPagination($search, $page, $perPage);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            error_log("Error in EntityController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch entities'
            ], 500);
        }
    }

    /**
     * Get single entity
     * GET /api/entities/:id
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function get(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $entity = $this->entityRepository->findById($id);

            if (!$entity) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Entity not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $entity
            ]);
        } catch (\Exception $e) {
            error_log("Error in EntityController::get - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch entity'
            ], 500);
        }
    }

    /**
     * Create new entity
     * POST /api/entities
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $body = $request->getParsedBody();

            // Validate required fields
            if (empty($body['name'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Name is required'
                ], 400);
            }

            // Prepare data
            $data = [
                'name' => $body['name'],
                'contact_person' => $body['contact_person'] ?? null,
                'phone' => $body['phone'] ?? null,
                'email' => $body['email'] ?? null,
                'cif_nif' => $body['cif_nif'] ?? null,
                'fiscal_address' => $body['fiscal_address'] ?? null,
                'postal_code' => $body['postal_code'] ?? null,
                'city' => $body['city'] ?? null,
                'province' => $body['province'] ?? null,
                'notes' => $body['notes'] ?? null,
                'color' => $body['color'] ?? '#3B82F6'
            ];

            $id = $this->entityRepository->create($data);

            if (!$id) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to create entity'
                ], 500);
            }

            $entity = $this->entityRepository->findById($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $entity
            ], 201);
        } catch (\Exception $e) {
            error_log("Error in EntityController::create - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to create entity'
            ], 500);
        }
    }

    /**
     * Update entity
     * PUT /api/entities/:id
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $body = $request->getParsedBody();

            // Check if entity exists
            $entity = $this->entityRepository->findById($id);
            if (!$entity) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Entity not found'
                ], 404);
            }

            // Prepare data (only include fields that are present)
            $data = [];
            if (isset($body['name'])) $data['name'] = $body['name'];
            if (isset($body['contact_person'])) $data['contact_person'] = $body['contact_person'];
            if (isset($body['phone'])) $data['phone'] = $body['phone'];
            if (isset($body['email'])) $data['email'] = $body['email'];
            if (isset($body['cif_nif'])) $data['cif_nif'] = $body['cif_nif'];
            if (isset($body['fiscal_address'])) $data['fiscal_address'] = $body['fiscal_address'];
            if (isset($body['postal_code'])) $data['postal_code'] = $body['postal_code'];
            if (isset($body['city'])) $data['city'] = $body['city'];
            if (isset($body['province'])) $data['province'] = $body['province'];
            if (isset($body['notes'])) $data['notes'] = $body['notes'];
            if (isset($body['color'])) $data['color'] = $body['color'];
            if (!empty($data)) {
                $success = $this->entityRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to update entity'
                    ], 500);
                }
            }

            $entity = $this->entityRepository->findById($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $entity
            ]);
        } catch (\Exception $e) {
            error_log("Error in EntityController::update - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to update entity'
            ], 500);
        }
    }

    /**
     * Delete entity
     * DELETE /api/entities/:id
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];

            // Check if entity exists
            $entity = $this->entityRepository->findById($id);
            if (!$entity) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Entity not found'
                ], 404);
            }

            $success = $this->entityRepository->delete($id);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to delete entity'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Entity deleted successfully'
            ]);
        } catch (\Exception $e) {
            error_log("Error in EntityController::delete - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to delete entity'
            ], 500);
        }
    }

    /**
     * Helper method to create JSON response
     *
     * @param Response $response
     * @param array $data
     * @param int $status
     * @return Response
     */
    private function jsonResponse(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
