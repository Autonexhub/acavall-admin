<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\UserRepository;
use App\Services\JWTService;
use App\Services\EmailService;
use App\Infrastructure\Database\Connection;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use PDO;

class AuthController
{
    private UserRepository $userRepository;
    private JWTService $jwtService;
    private EmailService $emailService;
    private PDO $db;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->jwtService = new JWTService();
        $this->emailService = new EmailService();
        $this->db = Connection::getInstance();
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

        // If user is being impersonated, add impersonator data from JWT
        if (isset($user->impersonator)) {
            $userData['impersonator'] = (array)$user->impersonator;
        }

        return $this->jsonResponse($response, [
            'success' => true,
            'data' => $userData
        ], 200);
    }

    /**
     * Forgot password endpoint
     * POST /api/auth/forgot-password
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function forgotPassword(Request $request, Response $response): Response
    {
        try {
            $body = $request->getParsedBody();
            $email = $body['email'] ?? null;

            if (!$email) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Email is required'
                ], 400);
            }

            // Find user by email
            $user = $this->userRepository->findByEmail($email);

            // Always return success to prevent email enumeration
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => true,
                    'message' => 'If the email exists, a password reset link will be sent'
                ], 200);
            }

            // Generate secure random token
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Store token in database
            $stmt = $this->db->prepare(
                'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)'
            );
            $stmt->execute([$email, $token, $expiresAt]);

            // Send password reset email
            $resetUrl = ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000') . '/reset-password?token=' . $token;
            $this->emailService->sendPasswordResetEmail($email, $user['name'], $resetUrl);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'If the email exists, a password reset link will be sent'
            ], 200);
        } catch (\Exception $e) {
            error_log('Error in forgotPassword: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to process password reset request'
            ], 500);
        }
    }

    /**
     * Verify reset token endpoint
     * POST /api/auth/verify-reset-token
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function verifyResetToken(Request $request, Response $response): Response
    {
        try {
            $body = $request->getParsedBody();
            $token = $body['token'] ?? null;

            if (!$token) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Token is required'
                ], 400);
            }

            // Check if token exists and is valid
            $stmt = $this->db->prepare(
                'SELECT * FROM password_reset_tokens
                WHERE token = ? AND expires_at > NOW() AND used = 0
                LIMIT 1'
            );
            $stmt->execute([$token]);
            $resetToken = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$resetToken) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Invalid or expired token'
                ], 400);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Token is valid'
            ], 200);
        } catch (\Exception $e) {
            error_log('Error in verifyResetToken: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to verify token'
            ], 500);
        }
    }

    /**
     * Reset password endpoint
     * POST /api/auth/reset-password
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function resetPassword(Request $request, Response $response): Response
    {
        try {
            $body = $request->getParsedBody();
            $token = $body['token'] ?? null;
            $password = $body['password'] ?? null;

            if (!$token || !$password) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Token and password are required'
                ], 400);
            }

            if (strlen($password) < 6) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Password must be at least 6 characters'
                ], 400);
            }

            // Check if token exists and is valid
            $stmt = $this->db->prepare(
                'SELECT * FROM password_reset_tokens
                WHERE token = ? AND expires_at > NOW() AND used = 0
                LIMIT 1'
            );
            $stmt->execute([$token]);
            $resetToken = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$resetToken) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Invalid or expired token'
                ], 400);
            }

            // Find user
            $user = $this->userRepository->findByEmail($resetToken['email']);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            // Update password
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $this->userRepository->update((int)$user['id'], ['password' => $hashedPassword]);

            // Mark token as used
            $stmt = $this->db->prepare(
                'UPDATE password_reset_tokens SET used = 1 WHERE token = ?'
            );
            $stmt->execute([$token]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Password reset successfully'
            ], 200);
        } catch (\Exception $e) {
            error_log('Error in resetPassword: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to reset password'
            ], 500);
        }
    }

    /**
     * Impersonate user endpoint (admin only)
     * POST /api/auth/impersonate/{userId}
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function impersonate(Request $request, Response $response, array $args): Response
    {
        try {
            // Get current user (admin)
            $currentUser = $request->getAttribute('user');

            if (!$currentUser || $currentUser->role !== 'admin') {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Only administrators can impersonate users'
                ], 403);
            }

            // Get user to impersonate
            $userId = (int)$args['userId'];
            $targetUser = $this->userRepository->findById($userId);

            if (!$targetUser) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            // Cannot impersonate yourself
            if ($userId === $currentUser->id) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Cannot impersonate yourself'
                ], 400);
            }

            // Get admin user data from database
            $adminUser = $this->userRepository->findById((int)$currentUser->id);

            // Generate impersonation token
            $token = $this->jwtService->generateToken($targetUser, $adminUser);

            // Sanitize user data
            $userData = $this->userRepository->sanitizeUser($targetUser);

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
                    'token' => $token,
                    'impersonating' => true
                ]
            ], 200)
                ->withHeader('Set-Cookie', $cookieValue);
        } catch (\Exception $e) {
            error_log('Error in impersonate: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to impersonate user'
            ], 500);
        }
    }

    /**
     * Stop impersonating endpoint
     * POST /api/auth/stop-impersonating
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function stopImpersonating(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');

            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'User not authenticated'
                ], 401);
            }

            // Check if user is impersonating
            if (!isset($user->impersonator)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Not currently impersonating'
                ], 400);
            }

            // Get original admin user
            $adminUser = $this->userRepository->findById((int)$user->impersonator->id);

            if (!$adminUser) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Original user not found'
                ], 404);
            }

            // Generate normal token for admin
            $token = $this->jwtService->generateToken($adminUser);

            // Sanitize user data
            $userData = $this->userRepository->sanitizeUser($adminUser);

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
        } catch (\Exception $e) {
            error_log('Error in stopImpersonating: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to stop impersonating'
            ], 500);
        }
    }

    /**
     * Test email configuration
     * POST /api/auth/test-email
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function testEmail(Request $request, Response $response): Response
    {
        try {
            // Get current user (admin only)
            $currentUser = $request->getAttribute('user');

            if (!$currentUser || $currentUser->role !== 'admin') {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Only administrators can test email'
                ], 403);
            }

            $body = $request->getParsedBody();
            $toEmail = $body['email'] ?? null;

            if (!$toEmail) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Email address is required'
                ], 400);
            }

            // Send test email
            $result = $this->emailService->sendTestEmail($toEmail);

            if ($result) {
                return $this->jsonResponse($response, [
                    'success' => true,
                    'message' => 'Test email sent successfully'
                ], 200);
            } else {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to send test email'
                ], 500);
            }
        } catch (\Exception $e) {
            error_log('Error in testEmail: ' . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to send test email: ' . $e->getMessage()
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
