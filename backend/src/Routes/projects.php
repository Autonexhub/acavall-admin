<?php

declare(strict_types=1);

use App\Controllers\ProjectController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Project Routes
 *
 * All routes require authentication
 */

$app->group('/api/projects', function (RouteCollectorProxy $group) {
    $projectController = new ProjectController();

    // List all projects
    $group->get('', [$projectController, 'list']);

    // Get single project
    $group->get('/{id:[0-9]+}', [$projectController, 'get']);

    // Create new project
    $group->post('', [$projectController, 'create']);

    // Update project
    $group->put('/{id:[0-9]+}', [$projectController, 'update']);

    // Delete project
    $group->delete('/{id:[0-9]+}', [$projectController, 'delete']);
})->add(new AuthMiddleware());
