<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\TherapistRepository;
use App\Repositories\StaffWorkHistoryRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class TherapistController
{
    private TherapistRepository $therapistRepository;
    private StaffWorkHistoryRepository $workHistoryRepository;

    public function __construct()
    {
        $this->therapistRepository = new TherapistRepository();
        $this->workHistoryRepository = new StaffWorkHistoryRepository();
    }

    /**
     * List all therapists
     * GET /api/therapists
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function list(Request $request, Response $response): Response
    {
        try {
            $therapists = $this->therapistRepository->findAllWithCounts();

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $therapists
            ]);
        } catch (\Exception $e) {
            error_log("Error in TherapistController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch therapists'
            ], 500);
        }
    }

    /**
     * Get single therapist
     * GET /api/therapists/:id
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
            $therapist = $this->therapistRepository->findWithWorkHistory($id);

            if (!$therapist) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Therapist not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $therapist
            ]);
        } catch (\Exception $e) {
            error_log("Error in TherapistController::get - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch therapist'
            ], 500);
        }
    }

    /**
     * Create new therapist
     * POST /api/therapists
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
                'email' => $body['email'] ?? null,
                'phone' => $body['phone'] ?? null,
                'specialty' => $body['specialty'] ?? null,
                'is_active' => isset($body['is_active']) ? (int)$body['is_active'] : 1
            ];

            $id = $this->therapistRepository->create($data);

            if (!$id) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to create therapist'
                ], 500);
            }

            // Attach entities if provided
            if (!empty($body['entity_ids']) && is_array($body['entity_ids'])) {
                $this->therapistRepository->attachEntities($id, $body['entity_ids']);
            }

            $therapist = $this->therapistRepository->findWithWorkHistory($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $therapist
            ], 201);
        } catch (\Exception $e) {
            error_log("Error in TherapistController::create - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to create therapist'
            ], 500);
        }
    }

    /**
     * Update therapist
     * PUT /api/therapists/:id
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

            // Check if therapist exists
            $therapist = $this->therapistRepository->findById($id);
            if (!$therapist) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Therapist not found'
                ], 404);
            }

            // Prepare data (only include fields that are present)
            $data = [];
            if (isset($body['name'])) $data['name'] = $body['name'];
            if (isset($body['email'])) $data['email'] = $body['email'];
            if (isset($body['phone'])) $data['phone'] = $body['phone'];
            if (isset($body['specialty'])) $data['specialty'] = $body['specialty'];
            if (isset($body['is_active'])) $data['is_active'] = (int)$body['is_active'];

            if (!empty($data)) {
                $success = $this->therapistRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to update therapist'
                    ], 500);
                }
            }

            // Update entities if provided
            if (isset($body['entity_ids'])) {
                $newEntityIds = is_array($body['entity_ids']) ? $body['entity_ids'] : [];

                // Get current entities
                $currentTherapist = $this->therapistRepository->findWithWorkHistory($id);
                $currentEntityIds = array_map(fn($e) => (int)$e['id'], $currentTherapist['entities'] ?? []);

                // Convert new IDs to integers
                $newEntityIds = array_map('intval', $newEntityIds);

                // Find entities to detach and attach
                $toDetach = array_diff($currentEntityIds, $newEntityIds);
                $toAttach = array_diff($newEntityIds, $currentEntityIds);

                error_log("Entity sync - Current: " . json_encode($currentEntityIds) . ", New: " . json_encode($newEntityIds) . ", Detach: " . json_encode($toDetach) . ", Attach: " . json_encode($toAttach));

                if (!empty($toDetach)) {
                    $this->therapistRepository->detachEntities($id, array_values($toDetach));
                }
                if (!empty($toAttach)) {
                    $this->therapistRepository->attachEntities($id, array_values($toAttach));
                }
            }

            $updatedTherapist = $this->therapistRepository->findWithWorkHistory($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $updatedTherapist
            ]);
        } catch (\Exception $e) {
            error_log("Error in TherapistController::update - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to update therapist'
            ], 500);
        }
    }

    /**
     * Delete therapist
     * DELETE /api/therapists/:id
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

            // Check if therapist exists
            $therapist = $this->therapistRepository->findById($id);
            if (!$therapist) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Therapist not found'
                ], 404);
            }

            $success = $this->therapistRepository->delete($id);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to delete therapist'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => [
                    'message' => 'Therapist deleted successfully'
                ]
            ]);
        } catch (\Exception $e) {
            error_log("Error in TherapistController::delete - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to delete therapist'
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
