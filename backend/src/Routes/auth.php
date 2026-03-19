<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Auth Routes
 *
 * Public routes:
 * - POST /api/auth/login
 * - POST /api/auth/forgot-password
 * - POST /api/auth/verify-reset-token
 * - POST /api/auth/reset-password
 *
 * Protected routes (require authentication):
 * - POST /api/auth/logout
 * - GET /api/auth/me
 */

$app->group('/api/auth', function (RouteCollectorProxy $group) {
    $authController = new AuthController();

    // Public routes - No authentication required
    $group->post('/login', [$authController, 'login']);
    $group->post('/forgot-password', [$authController, 'forgotPassword']);
    $group->post('/verify-reset-token', [$authController, 'verifyResetToken']);
    $group->post('/reset-password', [$authController, 'resetPassword']);

    // Protected routes - Authentication required
    $group->post('/logout', [$authController, 'logout'])
        ->add(new AuthMiddleware());

    $group->get('/me', [$authController, 'me'])
        ->add(new AuthMiddleware());
});
