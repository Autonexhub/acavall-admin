<?php

declare(strict_types=1);

use App\Controllers\ProgramController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Program Routes
 *
 * All routes require authentication
 * List/Get/Stats available to all authenticated users
 */

$app->group('/api/programs', function (RouteCollectorProxy $group) {
    $programController = new ProgramController();

    // List all programs (all authenticated users)
    $group->get('', [$programController, 'list']);

    // Get single program (all authenticated users)
    $group->get('/{id:[0-9]+}', [$programController, 'get']);

    // Get program statistics (all authenticated users)
    // Supports query params: start_date, end_date
    $group->get('/{id:[0-9]+}/stats', [$programController, 'stats']);
})->add(new AuthMiddleware());
