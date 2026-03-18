<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\UserRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserController
{
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
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

            // Validate required fields
            if (empty($body['name']) || empty($body['email']) || empty($body['password'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Name, email, and password are required'
                ], 400);
            }

            // Check if email already exists
            $existingUser = $this->userRepository->findByEmail($body['email']);
            if ($existingUser) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Email already exists'
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

            $id = $this->userRepository->create($data);

            if (!$id) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'error' => 'Failed to create user'
                ], 500);
            }

            $user = $this->userRepository->findById($id);
            $user = $this->userRepository->sanitizeUser($user);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            error_log("Error in UserController::create - " . $e->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'error' => 'Failed to create user'
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
                    'error' => 'User not found'
                ], 404);
            }

            // Prepare data
            $data = [];
            if (isset($body['name'])) $data['name'] = $body['name'];
            if (isset($body['email'])) {
                // Check if email is taken by another user
                $existingUser = $this->userRepository->findByEmail($body['email']);
                if ($existingUser && $existingUser['id'] != $id) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Email already exists'
                    ], 409);
                }
                $data['email'] = $body['email'];
            }
            if (isset($body['phone'])) $data['phone'] = $body['phone'];
            if (isset($body['role'])) $data['role'] = $body['role'];

            // Only update password if provided
            if (isset($body['password']) && !empty($body['password'])) {
                $data['password_hash'] = password_hash($body['password'], PASSWORD_BCRYPT);
            }

            if (!empty($data)) {
                $success = $this->userRepository->update($id, $data);
                if (!$success) {
                    return $this->jsonResponse($response, [
                        'success' => false,
                        'error' => 'Failed to update user'
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
                'error' => 'Failed to update user'
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
