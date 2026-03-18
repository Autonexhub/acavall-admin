<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\JWTService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

class AuthMiddleware
{
    private JWTService $jwtService;

    public function __construct()
    {
        $this->jwtService = new JWTService();
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
        $token = $this->getTokenFromRequest($request);

        if (!$token) {
            return $this->unauthorizedResponse('No token provided');
        }

        try {
            $decoded = $this->jwtService->validateToken($token);

            // Add user data to request attributes
            $request = $request->withAttribute('user', $decoded->data);

            return $handler->handle($request);
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($e->getMessage());
        }
    }

    /**
     * Get token from Authorization header or cookie
     *
     * @param Request $request
     * @return string|null
     */
    private function getTokenFromRequest(Request $request): ?string
    {
        // Try Authorization header first
        $authHeader = $request->getHeaderLine('Authorization');
        $token = $this->jwtService->extractTokenFromHeader($authHeader);

        if ($token) {
            return $token;
        }

        // Try cookie as fallback
        $cookies = $request->getCookieParams();
        return $cookies['auth_token'] ?? null;
    }

    /**
     * Create unauthorized response
     *
     * @param string $message Error message
     * @return Response
     */
    private function unauthorizedResponse(string $message): Response
    {
        $response = new SlimResponse();
        $data = [
            'success' => false,
            'error' => $message
        ];

        $response->getBody()->write(json_encode($data));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }
}
