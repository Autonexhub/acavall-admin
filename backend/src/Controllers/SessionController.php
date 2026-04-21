<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\SessionRepository;
use App\Services\RecurringSessionService;
use App\Helpers\DataSanitizer;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SessionController
{
    private SessionRepository $sessionRepository;
    private RecurringSessionService $recurringService;

    private const SESSION_TYPES = ['perros', 'gatos', 'caballos', 'sin_animales', 'entorno_natural'];

    public function __construct()
    {
        $this->sessionRepository = new SessionRepository();
        $this->recurringService = new RecurringSessionService();
    }

    /**
     * List all sessions
     * GET /api/sessions
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function list(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();

            // If date range provided, use findByDateRange
            if (!empty($params['start_date']) && !empty($params['end_date'])) {
                error_log("SessionController: Using date range: {$params['start_date']} to {$params['end_date']}");

                $filters = [];
                if (!empty($params['entity_id'])) {
                    $filters['entity_id'] = (int)$params['entity_id'];
                }
                if (!empty($params['project_id'])) {
                    $filters['project_id'] = (int)$params['project_id'];
                }
                if (!empty($params['program_id'])) {
                    $filters['program_id'] = (int)$params['program_id'];
                }
                if (!empty($params['therapist_id'])) {
                    $filters['therapist_id'] = (int)$params['therapist_id'];
                }

                $sessions = $this->sessionRepository->findByDateRange(
                    $params['start_date'],
                    $params['end_date'],
                    $filters
                );

                error_log("SessionController: Got " . count($sessions) . " sessions from repository");
            } else {
                error_log("SessionController: No date range, using findAll");
                $sessions = $this->sessionRepository->findAll();
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $sessions
            ]);
        } catch (\Exception $e) {
            error_log("Error in SessionController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch sessions'
            ], 500);
        }
    }

    /**
     * Get single session
     * GET /api/sessions/:id
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
            $session = $this->sessionRepository->findWithRelations($id);

            if (!$session) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Session not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $session
            ]);
        } catch (\Exception $e) {
            error_log("Error in SessionController::get - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch session'
            ], 500);
        }
    }

    /**
     * Create new session
     * POST /api/sessions
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
            if (empty($body['date'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Date is required'
                ], 400);
            }

            if (empty($body['entity_id'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Center is required'
                ], 400);
            }

            // Prepare base data with sanitization
            $data = [
                'date' => DataSanitizer::date($body['date']),
                'entity_id' => DataSanitizer::int($body['entity_id']),
                'project_id' => !empty($body['project_id']) ? DataSanitizer::int($body['project_id']) : null,
                'start_time' => DataSanitizer::time($body['start_time'] ?? null) ?? '00:00:00',
                'end_time' => DataSanitizer::time($body['end_time'] ?? null) ?? '00:00:00',
                'hours' => DataSanitizer::float($body['hours'] ?? null, 0.0),
                'participants' => DataSanitizer::int($body['participants'] ?? null, 0),
                'type' => DataSanitizer::enum($body['type'] ?? null, self::SESSION_TYPES, 'caballos'),
                'notes' => DataSanitizer::string($body['notes'] ?? null),
                'created_by' => $request->getAttribute('user_id')
            ];

            $therapistIds = !empty($body['therapist_ids']) && is_array($body['therapist_ids'])
                ? $body['therapist_ids']
                : [];

            // Check if this is a recurring session
            $isRecurring = !empty($body['recurrence_rule']);

            if ($isRecurring) {
                // Create multiple recurring sessions
                $recurrenceRule = $body['recurrence_rule'];
                $sessions = $this->recurringService->createRecurringSessions($data, $recurrenceRule);

                $createdSessions = [];
                foreach ($sessions as $sessionData) {
                    $id = $this->sessionRepository->create($sessionData);
                    if ($id) {
                        // Attach therapists to each occurrence
                        if (!empty($therapistIds)) {
                            $this->sessionRepository->attachTherapists($id, $therapistIds);
                        }
                        $createdSessions[] = $this->sessionRepository->findWithRelations($id);
                    }
                }

                return $this->jsonResponse($response, [
                    'success' => true,
                    'data' => $createdSessions,
                    'message' => count($createdSessions) . ' recurring sessions created'
                ], 201);
            } else {
                // Create single session
                $id = $this->sessionRepository->create($data);

                if (!$id) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to create session'
                    ], 500);
                }

                // Attach therapists if provided
                if (!empty($therapistIds)) {
                    $this->sessionRepository->attachTherapists($id, $therapistIds);
                }

                $session = $this->sessionRepository->findWithRelations($id);

                return $this->jsonResponse($response, [
                    'success' => true,
                    'data' => $session
                ], 201);
            }
        } catch (\Exception $e) {
            error_log("Error in SessionController::create - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to create session'
            ], 500);
        }
    }

    /**
     * Update session
     * PUT /api/sessions/:id
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

            // Check if session exists
            $session = $this->sessionRepository->findById($id);
            if (!$session) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Session not found'
                ], 404);
            }

            // Prepare data with sanitization (only include fields that are present)
            $data = [];
            if (isset($body['date'])) $data['date'] = DataSanitizer::date($body['date']);
            if (isset($body['entity_id'])) $data['entity_id'] = DataSanitizer::int($body['entity_id']);
            if (isset($body['project_id'])) $data['project_id'] = !empty($body['project_id']) ? DataSanitizer::int($body['project_id']) : null;
            if (isset($body['start_time'])) $data['start_time'] = DataSanitizer::time($body['start_time']) ?? '00:00:00';
            if (isset($body['end_time'])) $data['end_time'] = DataSanitizer::time($body['end_time']) ?? '00:00:00';
            if (isset($body['hours'])) $data['hours'] = DataSanitizer::float($body['hours'], 0.0);
            if (isset($body['participants'])) $data['participants'] = DataSanitizer::int($body['participants'], 0);
            if (isset($body['type'])) $data['type'] = DataSanitizer::enum($body['type'], self::SESSION_TYPES, 'caballos');
            if (array_key_exists('notes', $body)) $data['notes'] = DataSanitizer::string($body['notes']);

            if (!empty($data)) {
                $success = $this->sessionRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to update session'
                    ], 500);
                }
            }

            // Sync therapists if provided
            if (isset($body['therapist_ids']) && is_array($body['therapist_ids'])) {
                $this->sessionRepository->syncTherapists($id, $body['therapist_ids']);
            }

            $updatedSession = $this->sessionRepository->findWithRelations($id);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $updatedSession
            ]);
        } catch (\Exception $e) {
            error_log("Error in SessionController::update - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to update session'
            ], 500);
        }
    }

    /**
     * Delete session
     * DELETE /api/sessions/:id
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

            // Check if session exists
            $session = $this->sessionRepository->findById($id);
            if (!$session) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Session not found'
                ], 404);
            }

            $success = $this->sessionRepository->delete($id);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to delete session'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => [
                    'message' => 'Session deleted successfully'
                ]
            ]);
        } catch (\Exception $e) {
            error_log("Error in SessionController::delete - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to delete session'
            ], 500);
        }
    }

    /**
     * Get session statistics
     * GET /api/sessions/stats
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function stats(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();

            $filters = [];
            if (!empty($params['start_date'])) {
                $filters['start_date'] = $params['start_date'];
            }
            if (!empty($params['end_date'])) {
                $filters['end_date'] = $params['end_date'];
            }
            if (!empty($params['entity_id'])) {
                $filters['entity_id'] = (int)$params['entity_id'];
            }
            if (!empty($params['program_id'])) {
                $filters['program_id'] = (int)$params['program_id'];
            }

            $stats = $this->sessionRepository->getStats($filters);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            error_log("Error in SessionController::stats - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch session statistics'
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
