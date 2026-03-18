<?php

declare(strict_types=1);

use App\Controllers\EntityController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Entity Routes
 *
 * All routes require authentication
 */

$app->group('/api/entities', function (RouteCollectorProxy $group) {
    $entityController = new EntityController();

    // List all entities with search and pagination
    $group->get('', [$entityController, 'list']);

    // Get single entity
    $group->get('/{id:[0-9]+}', [$entityController, 'get']);

    // Create new entity
    $group->post('', [$entityController, 'create']);

    // Update entity
    $group->put('/{id:[0-9]+}', [$entityController, 'update']);

    // Delete entity
    $group->delete('/{id:[0-9]+}', [$entityController, 'delete']);
})->add(new AuthMiddleware());
