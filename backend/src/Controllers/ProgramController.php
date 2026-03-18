<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\ProgramRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ProgramController
{
    private ProgramRepository $programRepository;

    public function __construct()
    {
        $this->programRepository = new ProgramRepository();
    }

    /**
     * List all programs
     * GET /api/programs
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function list(Request $request, Response $response): Response
    {
        try {
            $programs = $this->programRepository->findAllWithStats();

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $programs
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProgramController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch programs'
            ], 500);
        }
    }

    /**
     * Get single program
     * GET /api/programs/:id
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
            $program = $this->programRepository->findById($id);

            if (!$program) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Program not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $program
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProgramController::get - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch program'
            ], 500);
        }
    }

    /**
     * Get program statistics
     * GET /api/programs/:id/stats
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function stats(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];
            $params = $request->getQueryParams();

            // Check if program exists
            $program = $this->programRepository->findById($id);
            if (!$program) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Program not found'
                ], 404);
            }

            $filters = [];
            if (!empty($params['start_date'])) {
                $filters['start_date'] = $params['start_date'];
            }
            if (!empty($params['end_date'])) {
                $filters['end_date'] = $params['end_date'];
            }

            $stats = $this->programRepository->getStats($id, $filters);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            error_log("Error in ProgramController::stats - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch program statistics'
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
