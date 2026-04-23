<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\UserRepository;
use App\Services\EmailService;
use App\Infrastructure\Database\Connection;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use PDO;

class UserController
{
    private UserRepository $userRepository;
    private EmailService $emailService;
    private PDO $db;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
        $this->emailService = new EmailService();
        $this->db = Connection::getInstance();
    }

    /**
     * List all users
     * GET /api/users
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function list(Request $request, Response $response): Response
    {
        try {
            $users = $this->userRepository->findAll();

            // Sanitize users (remove password hashes)
            $users = array_map(function($user) {
                return $this->userRepository->sanitizeUser($user);
            }, $users);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            error_log("Error in UserController::list - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch users'
            ], 500);
        }
    }

    /**
     * Get single user
     * GET /api/users/:id
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
            $user = $this->userRepository->findById($id);

            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            // Sanitize user (remove password hash)
            $user = $this->userRepository->sanitizeUser($user);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            error_log("Error in UserController::get - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to fetch user'
            ], 500);
        }
    }

    /**
     * Create new user
     * POST /api/users
     *
     * @param Request $request
     * @param Response $response
     * @return Response
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $body = $request->getParsedBody();

            error_log("UserController::create - Starting user creation");
            error_log("UserController::create - Request body: " . json_encode([
                'name' => $body['name'] ?? 'NOT SET',
                'email' => $body['email'] ?? 'NOT SET',
                'role' => $body['role'] ?? 'NOT SET',
                'password' => isset($body['password']) ? 'SET (length: ' . strlen($body['password']) . ')' : 'NOT SET'
            ]));

            // Validate required fields
            if (empty($body['name'])) {
                error_log("UserController::create - Validation failed: name is empty");
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'El nombre es obligatorio',
                    'field' => 'name'
                ], 400);
            }

            if (empty($body['email'])) {
                error_log("UserController::create - Validation failed: email is empty");
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'El email es obligatorio',
                    'field' => 'email'
                ], 400);
            }

            if (empty($body['password'])) {
                error_log("UserController::create - Validation failed: password is empty");
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'La contraseña es obligatoria',
                    'field' => 'password'
                ], 400);
            }

            if (strlen($body['password']) < 6) {
                error_log("UserController::create - Validation failed: password too short");
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'La contraseña debe tener al menos 6 caracteres',
                    'field' => 'password'
                ], 400);
            }

            // Validate email format
            if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
                error_log("UserController::create - Validation failed: invalid email format");
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'El formato del email no es válido',
                    'field' => 'email'
                ], 400);
            }

            // Check if email already exists
            error_log("UserController::create - Checking if email exists: " . $body['email']);
            $existingUser = $this->userRepository->findByEmail($body['email']);
            if ($existingUser) {
                error_log("UserController::create - Email already exists for user ID: " . $existingUser['id']);
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Ya existe un usuario con este email: ' . $body['email'],
                    'field' => 'email'
                ], 409);
            }

            // Hash password
            $passwordHash = password_hash($body['password'], PASSWORD_BCRYPT);

            // Prepare data
            $data = [
                'name' => $body['name'],
                'email' => $body['email'],
                'password_hash' => $passwordHash,
                'role' => $body['role'] ?? 'therapist',
                'phone' => $body['phone'] ?? null,
            ];

            error_log("UserController::create - Creating user with data: " . json_encode([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $data['role'],
                'phone' => $data['phone']
            ]));

            $id = $this->userRepository->create($data);

            if (!$id) {
                error_log("UserController::create - Repository returned null/false ID");
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Error al crear el usuario en la base de datos. El repositorio no devolvió un ID válido.'
                ], 500);
            }

            error_log("UserController::create - User created successfully with ID: " . $id);

            $user = $this->userRepository->findById($id);
            $user = $this->userRepository->sanitizeUser($user);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $user
            ], 201);
        } catch (\PDOException $e) {
            error_log("UserController::create - PDO Exception: " . $e->getMessage());
            error_log("UserController::create - SQL State: " . $e->getCode());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Error de base de datos: ' . $e->getMessage(),
                'code' => $e->getCode()
            ], 500);
        } catch (\Exception $e) {
            error_log("UserController::create - Exception: " . $e->getMessage());
            error_log("UserController::create - Stack trace: " . $e->getTraceAsString());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Error al crear usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user
     * PUT /api/users/:id
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

            // Check if user exists
            $user = $this->userRepository->findById($id);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            // Prepare data
            $data = [];
            if (isset($body['name'])) $data['name'] = $body['name'];
            if (isset($body['email'])) {
                // Validate email format
                if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'El formato del email no es válido'
                    ], 400);
                }
                // Check if email is taken by another user
                $existingUser = $this->userRepository->findByEmail($body['email']);
                if ($existingUser && $existingUser['id'] != $id) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Ya existe otro usuario con este email'
                    ], 409);
                }
                $data['email'] = $body['email'];
            }
            if (isset($body['phone'])) $data['phone'] = $body['phone'];
            if (isset($body['role'])) $data['role'] = $body['role'];

            // Only update password if provided
            if (isset($body['password']) && !empty($body['password'])) {
                if (strlen($body['password']) < 6) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'La contraseña debe tener al menos 6 caracteres'
                    ], 400);
                }
                $data['password_hash'] = password_hash($body['password'], PASSWORD_BCRYPT);
            }

            if (!empty($data)) {
                $success = $this->userRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Error al actualizar el usuario'
                    ], 500);
                }
            }

            $user = $this->userRepository->findById($id);
            $user = $this->userRepository->sanitizeUser($user);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            error_log("Error in UserController::update - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Error al actualizar usuario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend invite email to user
     * POST /api/users/:id/resend-invite
     *
     * @param Request $request
     * @param Response $response
     * @param array $args
     * @return Response
     */
    public function resendInvite(Request $request, Response $response, array $args): Response
    {
        try {
            $id = (int)$args['id'];

            error_log("UserController::resendInvite - Starting for user ID: {$id}");

            // Check if user exists
            $user = $this->userRepository->findById($id);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            // Check if user has email
            if (empty($user['email'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'El usuario no tiene email configurado'
                ], 400);
            }

            // Invalidate any existing tokens for this email
            $stmt = $this->db->prepare(
                'UPDATE password_reset_tokens SET used = 1 WHERE email = ?'
            );
            $stmt->execute([$user['email']]);

            // Generate new invite token (valid for 7 days)
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

            // Store token in database
            $stmt = $this->db->prepare(
                'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)'
            );
            $stmt->execute([$user['email'], $token, $expiresAt]);

            // Send invite email
            $setupUrl = ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000') . '/reset-password?token=' . $token;

            error_log("UserController::resendInvite - Sending invite to: {$user['email']}");

            try {
                $emailResult = $this->emailService->sendInviteEmail(
                    $user['email'],
                    $user['name'],
                    $setupUrl
                );

                if ($emailResult) {
                    error_log("UserController::resendInvite - Email sent successfully");
                    return $this->jsonResponse($response, [
                        'success' => true,
                        'message' => 'Invitación enviada correctamente a ' . $user['email']
                    ]);
                } else {
                    error_log("UserController::resendInvite - Email sending returned false");
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'El servidor de correo no pudo enviar el email'
                    ], 500);
                }
            } catch (\Exception $emailError) {
                error_log("UserController::resendInvite - Email error: " . $emailError->getMessage());
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Error de email: ' . $emailError->getMessage()
                ], 500);
            }
        } catch (\Exception $e) {
            error_log("UserController::resendInvite - Exception: " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Error al reenviar invitación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/users/:id
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

            // Check if user exists
            $user = $this->userRepository->findById($id);
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'User not found'
                ], 404);
            }

            // Prevent deleting yourself (optional safety check)
            $currentUserId = $request->getAttribute('user_id');
            if ($id === $currentUserId) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Cannot delete your own account'
                ], 403);
            }

            $success = $this->userRepository->delete($id);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to delete user'
                ], 500);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            error_log("Error in UserController::delete - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to delete user'
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
