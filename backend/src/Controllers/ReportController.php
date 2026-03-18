<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\TherapistRepository;
use App\Repositories\SessionRepository;
use App\Repositories\EntityRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ReportController
{
    private TherapistRepository $therapistRepository;
    private SessionRepository $sessionRepository;
    private EntityRepository $entityRepository;

    public function __construct()
    {
        $this->therapistRepository = new TherapistRepository();
        $this->sessionRepository = new SessionRepository();
        $this->entityRepository = new EntityRepository();
    }

    /**
     * Get therapist hours report
     * GET /api/reports/therapist-hours
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function therapistHours(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();
            $startDate = $params['start_date'] ?? null;
            $endDate = $params['end_date'] ?? null;

            $therapists = $this->therapistRepository->findAll();
            $report = [];

            foreach ($therapists as $therapist) {
                $hours = $this->therapistRepository->getHoursWorked(
                    (int)$therapist['id'],
                    $startDate,
                    $endDate
                );

                $report[] = [
                    'therapist_id' => $therapist['id'],
                    'therapist_name' => $therapist['name'],
                    'total_hours' => $hours
                ];
            }

            // Sort by hours descending
            usort($report, fn($a, $b) => $b['total_hours'] <=> $a['total_hours']);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            error_log("Error in ReportController::therapistHours - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch therapist hours report'
            ], 500);
        }
    }

    /**
     * Get entity sessions report
     * GET /api/reports/center-sessions
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function entitySessions(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();
            $startDate = $params['start_date'] ?? null;
            $endDate = $params['end_date'] ?? null;

            $entities = $this->entityRepository->findAll();
            $report = [];

            foreach ($entities as $entity) {
                $filters = ['entity_id' => $entity['id']];

                $sessions = [];
                if ($startDate && $endDate) {
                    $sessions = $this->sessionRepository->findByDateRange(
                        $startDate,
                        $endDate,
                        $filters
                    );
                } else {
                    // Get all sessions for this center
                    $db = \App\Infrastructure\Database\Connection::getInstance();
                    $stmt = $db->prepare("
                        SELECT * FROM sessions WHERE entity_id = ?
                    ");
                    $stmt->execute([$entity['id']]);
                    $sessions = $stmt->fetchAll();
                }

                $totalParticipants = array_sum(array_column($sessions, 'participants'));
                $totalHours = array_sum(array_column($sessions, 'hours'));

                $report[] = [
                    'entity_id' => $entity['id'],
                    'entity_name' => $entity['name'],
                    'session_count' => count($sessions),
                    'total_participants' => $totalParticipants,
                    'total_hours' => $totalHours
                ];
            }

            // Sort by session count descending
            usort($report, fn($a, $b) => $b['session_count'] <=> $a['session_count']);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $report
            ]);
        } catch (\Exception $e) {
            error_log("Error in ReportController::entitySessions - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch entity sessions report'
            ], 500);
        }
    }

    /**
     * Get impact metrics
     * GET /api/reports/impact
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function impact(Request $request, Response $response): Response
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

            // Get sessions
            $sessions = [];
            if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
                $sessions = $this->sessionRepository->findByDateRange(
                    $filters['start_date'],
                    $filters['end_date']
                );
            } else {
                $sessions = $this->sessionRepository->findAll();
            }

            // Calculate metrics
            $totalSessions = count($sessions);
            $totalParticipants = array_sum(array_column($sessions, 'participants'));
            $totalHours = array_sum(array_column($sessions, 'hours'));

            // Get unique centers
            $entityIds = array_unique(array_column($sessions, 'entity_id'));
            $totalEntities = count($entityIds);

            // Get monthly breakdown
            $monthlyStats = $this->sessionRepository->getStats($filters);

            $impact = [
                'total_sessions' => $totalSessions,
                'total_participants' => $totalParticipants,
                'total_hours' => $totalHours,
                'total_entities' => $totalEntities,
                'monthly_breakdown' => $monthlyStats
            ];

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $impact
            ]);
        } catch (\Exception $e) {
            error_log("Error in ReportController::impact - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch impact metrics'
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
