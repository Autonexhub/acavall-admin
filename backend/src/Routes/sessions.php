<?php

declare(strict_types=1);

use App\Controllers\SessionController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Session Routes
 *
 * All routes require authentication
 * Create/Update/Delete require admin or coordinator role
 * List/Get/Stats available to all authenticated users
 */

$app->group('/api/sessions', function (RouteCollectorProxy $group) {
    $sessionController = new SessionController();

    // Get session statistics (all authenticated users)
    $group->get('/stats', [$sessionController, 'stats']);

    // List all sessions (all authenticated users)
    // Supports query params: start_date, end_date, center_id, program_id, therapist_id
    $group->get('', [$sessionController, 'list']);

    // Get single session (all authenticated users)
    $group->get('/{id:[0-9]+}', [$sessionController, 'get']);

    // Create session (admin/coordinator only)
    $group->post('', [$sessionController, 'create'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Update session (admin/coordinator only)
    $group->put('/{id:[0-9]+}', [$sessionController, 'update'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Delete session (admin only)
    $group->delete('/{id:[0-9]+}', [$sessionController, 'delete'])
        ->add(new RoleMiddleware(['admin']));
})->add(new AuthMiddleware());
