<?php

declare(strict_types=1);

use App\Controllers\StaffWorkHistoryController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Staff Work History Routes
 *
 * All routes require authentication
 */

// Work history routes nested under therapists
$app->group('/api/therapists/{therapistId:[0-9]+}/work-history', function (RouteCollectorProxy $group) {
    $controller = new StaffWorkHistoryController();

    // List work history for therapist
    $group->get('', [$controller, 'list']);

    // Create work history entry
    $group->post('', [$controller, 'create']);
})->add(new AuthMiddleware());

// Direct work history routes for update/delete
$app->group('/api/work-history', function (RouteCollectorProxy $group) {
    $controller = new StaffWorkHistoryController();

    // Update work history entry
    $group->put('/{id:[0-9]+}', [$controller, 'update']);

    // Delete work history entry
    $group->delete('/{id:[0-9]+}', [$controller, 'delete']);
})->add(new AuthMiddleware());
