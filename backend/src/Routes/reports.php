<?php

declare(strict_types=1);

use App\Controllers\ReportController;
use App\Middleware\AuthMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Report Routes
 *
 * All routes require authentication
 * Available to all authenticated users
 */

$app->group('/api/reports', function (RouteCollectorProxy $group) {
    $reportController = new ReportController();

    // Get therapist hours report
    // Supports query params: start_date, end_date
    $group->get('/therapist-hours', [$reportController, 'therapistHours']);

    // Get center sessions report
    // Supports query params: start_date, end_date
    $group->get('/center-sessions', [$reportController, 'centerSessions']);

    // Get impact metrics
    // Supports query params: start_date, end_date
    $group->get('/impact', [$reportController, 'impact']);
})->add(new AuthMiddleware());
