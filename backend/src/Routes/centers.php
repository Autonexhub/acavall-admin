<?php

declare(strict_types=1);

use App\Controllers\CenterController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Center Routes
 *
 * All routes require authentication
 * Create/Update/Delete require admin or coordinator role
 * List/Get available to all authenticated users
 */

$app->group('/api/centers', function (RouteCollectorProxy $group) {
    $centerController = new CenterController();

    // List all centers (all authenticated users)
    $group->get('', [$centerController, 'list']);

    // Get single center (all authenticated users)
    $group->get('/{id:[0-9]+}', [$centerController, 'get']);

    // Create center (admin/coordinator only)
    $group->post('', [$centerController, 'create'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Update center (admin/coordinator only)
    $group->put('/{id:[0-9]+}', [$centerController, 'update'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Delete center (admin only)
    $group->delete('/{id:[0-9]+}', [$centerController, 'delete'])
        ->add(new RoleMiddleware(['admin']));
})->add(new AuthMiddleware());
