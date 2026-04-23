<?php

declare(strict_types=1);

use App\Controllers\TherapistController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use Slim\Routing\RouteCollectorProxy;

/**
 * Therapist Routes
 *
 * All routes require authentication
 * Create/Update/Delete require admin or coordinator role
 * List/Get available to all authenticated users
 */

$app->group('/api/therapists', function (RouteCollectorProxy $group) {
    $therapistController = new TherapistController();

    // List all therapists (all authenticated users)
    $group->get('', [$therapistController, 'list']);

    // Get single therapist (all authenticated users)
    $group->get('/{id:[0-9]+}', [$therapistController, 'get']);

    // Create therapist (admin/coordinator only)
    $group->post('', [$therapistController, 'create'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Update therapist (admin/coordinator only)
    $group->put('/{id:[0-9]+}', [$therapistController, 'update'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Resend invite email (admin/coordinator only)
    $group->post('/{id:[0-9]+}/resend-invite', [$therapistController, 'resendInvite'])
        ->add(new RoleMiddleware(['admin', 'coordinator']));

    // Delete therapist (admin only)
    $group->delete('/{id:[0-9]+}', [$therapistController, 'delete'])
        ->add(new RoleMiddleware(['admin']));
})->add(new AuthMiddleware());
