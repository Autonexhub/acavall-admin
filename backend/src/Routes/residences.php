<?php

declare(strict_types=1);

use App\Controllers\ResidenceController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Residence Routes
 *
 * All routes require authentication
 * Phase 1: Read-only access (list and get only)
 */

$app->group('/api/residences', function (RouteCollectorProxy $group) {
    $residenceController = new ResidenceController();

    // List all residences (all authenticated users)
    // Supports query param: year
    $group->get('', [$residenceController, 'list']);

    // Get single residence (all authenticated users)
    $group->get('/{id:[0-9]+}', [$residenceController, 'get']);
})->add(new AuthMiddleware());
