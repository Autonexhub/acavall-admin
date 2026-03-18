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
 *
 * Protected routes (require authentication):
 * - POST /api/auth/logout
 * - GET /api/auth/me
 */

$app->group('/api/auth', function (RouteCollectorProxy $group) {
    $authController = new AuthController();

    // Public routes - No authentication required
    $group->post('/login', [$authController, 'login']);

    // Protected routes - Authentication required
    $group->post('/logout', [$authController, 'logout'])
        ->add(new AuthMiddleware());

    $group->get('/me', [$authController, 'me'])
        ->add(new AuthMiddleware());
});
