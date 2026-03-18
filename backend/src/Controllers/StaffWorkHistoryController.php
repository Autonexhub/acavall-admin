<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\StaffWorkHistoryRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class StaffWorkHistoryController
{
    private StaffWorkHistoryRepository $workHistoryRepository;

    public function __construct()
    {
        $this->workHistoryRepository = new StaffWorkHistoryRepository();
    }

    /**
     * Get work history for a therapist
     * GET /api/therapists/:therapistId/work-history
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function list(Request $request, Response $response, array $args): Response
    {
        try {
            $therapistId = (int)$args['therapistId'];
            $workHistory = $this->workHistoryRepository->findByTherapistId($therapistId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $workHistory
            ]);
        } catch (\Exception $e) {
            error_log("Error in StaffWorkHistoryController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch work history'
            ], 500);
        }
    }

    /**
     * Create work history entry
     * POST /api/therapists/:therapistId/work-history
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function create(Request $request, Response $response, array $args): Response
    {
        try {
            $therapistId = (int)$args['therapistId'];
            $body = $request->getParsedBody();

            // Validate required fields
            if (empty($body['entity_id']) || empty($body['role']) || empty($body['start_date'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Entity, role, and start date are required'
                ], 400);
            }

            // Prepare data
            $data = [
                'therapist_id' => $therapistId,
                'entity_id' => (int)$body['entity_id'],
                'role' => $body['role'],
                'start_date' => $body['start_date'],
            ];

            if (isset($body['end_date']) && !empty($body['end_date'])) {
                $data['end_date'] = $body['end_date'];
            }

            if (isset($body['notes'])) {
                $data['notes'] = $body['notes'];
            }

            $id = $this->workHistoryRepository->create($data);

            if (!$id) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to create work history entry'
                ], 500);
            }

            $entry = $this->workHistoryRepository->findById($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $entry
            ], 201);
        } catch (\Exception $e) {
            error_log("Error in StaffWorkHistoryController::create - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to create work history entry'
            ], 500);
        }
    }

    /**
     * Update work history entry
     * PUT /api/work-history/:id
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

            // Check if entry exists
            $entry = $this->workHistoryRepository->findById($id);
            if (!$entry) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Work history entry not found'
                ], 404);
            }

            // Prepare data
            $data = [];
            if (isset($body['entity_id'])) $data['entity_id'] = (int)$body['entity_id'];
            if (isset($body['role'])) $data['role'] = $body['role'];
            if (isset($body['start_date'])) $data['start_date'] = $body['start_date'];
            if (isset($body['end_date'])) $data['end_date'] = $body['end_date'];
            if (isset($body['notes'])) $data['notes'] = $body['notes'];

            if (!empty($data)) {
                $success = $this->workHistoryRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to update work history entry'
                    ], 500);
                }
            }

            $entry = $this->workHistoryRepository->findById($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $entry
            ]);
        } catch (\Exception $e) {
            error_log("Error in StaffWorkHistoryController::update - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to update work history entry'
            ], 500);
        }
    }

    /**
     * Delete work history entry
     * DELETE /api/work-history/:id
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

            // Check if entry exists
            $entry = $this->workHistoryRepository->findById($id);
            if (!$entry) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Work history entry not found'
                ], 404);
            }

            $success = $this->workHistoryRepository->delete($id);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to delete work history entry'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Work history entry deleted successfully'
            ]);
        } catch (\Exception $e) {
            error_log("Error in StaffWorkHistoryController::delete - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to delete work history entry'
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
