<?php

declare(strict_types=1);

namespace App\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

class RoleMiddleware
{
    private array $allowedRoles;

    /**
     * Hardcoded role hierarchy
     * admin > coordinator > therapist
     */
    private const ROLE_HIERARCHY = [
        'admin' => 3,
        'coordinator' => 2,
        'therapist' => 1
    ];

    /**
     * Constructor
     *
     * @param array $allowedRoles Array of allowed roles for this route
     */
    public function __construct(array $allowedRoles)
    {
        $this->allowedRoles = $allowedRoles;
    }

    /**
     * Invoke middleware
     *
     * @param Request $request
     * @param RequestHandler $handler
     * @return Response
     */
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $user = $request->getAttribute('user');

        if (!$user) {
            return $this->forbiddenResponse('User not authenticated');
        }

        $userRole = $user->role ?? null;

        if (!$userRole) {
            return $this->forbiddenResponse('User role not found');
        }

        if (!$this->hasPermission($userRole)) {
            return $this->forbiddenResponse('Insufficient permissions');
        }

        return $handler->handle($request);
    }

    /**
     * Check if user role has permission
     *
     * @param string $userRole
     * @return bool
     */
    private function hasPermission(string $userRole): bool
    {
        // Get user role level
        $userLevel = self::ROLE_HIERARCHY[$userRole] ?? 0;

        // Check if user role is in allowed roles or has higher level
        foreach ($this->allowedRoles as $allowedRole) {
            $allowedLevel = self::ROLE_HIERARCHY[$allowedRole] ?? 0;

            if ($userLevel >= $allowedLevel) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create forbidden response
     *
     * @param string $message Error message
     * @return Response
     */
    private function forbiddenResponse(string $message): Response
    {
        $response = new SlimResponse();
        $data = [
            'success' => false,
            'error' => $message
        ];

        $response->getBody()->write(json_encode($data));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(403);
    }
}
