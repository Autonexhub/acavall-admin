<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\UserRepository;
use App\Services\JWTService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private UserRepository $userRepository;
    private JWTService $jwtService;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->jwtService = new JWTService();
    }

    /**
     * Login endpoint
     * POST /api/auth/login
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function login(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        $email = $body['email'] ?? null;
        $password = $body['password'] ?? null;

        // Validate input
        if (!$email || !$password) {
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Email and password are required'
            ], 400);
        }

        // Find user by email
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Invalid credentials'
            ], 401);
        }

        // Verify password
        if (!$this->userRepository->verifyPassword($password, $user['password_hash'])) {
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Invalid credentials'
            ], 401);
        }

        // Generate JWT token
        $token = $this->jwtService->generateToken($user);

        // Sanitize user data (remove password)
        $userData = $this->userRepository->sanitizeUser($user);

        // Set httpOnly cookie
        $expiresAt = time() + (int)($_ENV['JWT_EXPIRATION'] ?? 3600);
        $cookieValue = "auth_token={$token}; HttpOnly; Path=/; Max-Age=" . ($expiresAt - time()) . "; SameSite=Lax";

        // Add Secure flag in production
        if (($_ENV['APP_ENV'] ?? 'development') === 'production') {
            $cookieValue .= "; Secure";
        }

        return $this->jsonResponse($response, [
            'success' => true,
            'data' => [
                'user' => $userData,
                'token' => $token
            ]
        ], 200)
            ->withHeader('Set-Cookie', $cookieValue);
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function logout(Request $request, Response $response): Response
    {
        // Clear cookie by setting it with a past expiration date
        $cookieValue = "auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax";

        return $this->jsonResponse($response, [
            'success' => true,
            'data' => [
                'message' => 'Logged out successfully'
            ]
        ], 200)
            ->withHeader('Set-Cookie', $cookieValue);
    }

    /**
     * Get current user endpoint
     * GET /api/auth/me
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function me(Request $request, Response $response): Response
    {
        $user = $request->getAttribute('user');

        if (!$user) {
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'User not authenticated'
            ], 401);
        }

        // Fetch fresh user data from database
        $userData = $this->userRepository->findById((int)$user->id);

        if (!$userData) {
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'User not found'
            ], 404);
        }

        // Sanitize user data (remove password)
        $userData = $this->userRepository->sanitizeUser($userData);

        return $this->jsonResponse($response, [
            'success' => true,
            'data' => $userData
        ], 200);
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
