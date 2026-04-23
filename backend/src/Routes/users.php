<?php

declare(strict_types=1);

use App\Controllers\UserController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * User Management Routes
 *
 * All routes require authentication
 * Note: Only admin users should be able to access these routes in production
 */

$app->group('/api/users', function (RouteCollectorProxy $group) {
    $userController = new UserController();

    // List all users
    $group->get('', [$userController, 'list']);

    // Get single user
    $group->get('/{id:[0-9]+}', [$userController, 'get']);

    // Create new user
    $group->post('', [$userController, 'create']);

    // Update user
    $group->put('/{id:[0-9]+}', [$userController, 'update']);

    // Resend invite email
    $group->post('/{id:[0-9]+}/resend-invite', [$userController, 'resendInvite']);

    // Delete user
    $group->delete('/{id:[0-9]+}', [$userController, 'delete']);
})->add(new AuthMiddleware());
