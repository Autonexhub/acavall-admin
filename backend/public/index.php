<?php

declare(strict_types=1);

use Slim\Factory\AppFactory;
use DI\Container;
use App\Infrastructure\Database\Connection;
use App\Middleware\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Create DI Container
$container = new Container();
AppFactory::setContainer($container);

// Create App
$app = AppFactory::create();

// Add Routing Middleware
$app->addRoutingMiddleware();

// Add CORS Middleware (after routing so it applies to all responses)
$app->add(new CorsMiddleware());

// Handle OPTIONS preflight requests for all routes
$app->options('/{routes:.+}', function ($request, $response) {
    return $response;
});

// Body Parsing Middleware
$app->addBodyParsingMiddleware();

// Error Middleware
$errorMiddleware = $app->addErrorMiddleware(
    $_ENV['APP_DEBUG'] === 'true',
    true,
    true
);

// Load routes
require __DIR__ . '/../src/Routes/auth.php';
require __DIR__ . '/../src/Routes/therapists.php';
require __DIR__ . '/../src/Routes/sessions.php';
require __DIR__ . '/../src/Routes/programs.php';
require __DIR__ . '/../src/Routes/projects.php';
require __DIR__ . '/../src/Routes/reports.php';
require __DIR__ . '/../src/Routes/entities.php';
require __DIR__ . '/../src/Routes/work-history.php';
require __DIR__ . '/../src/Routes/users.php';

// Health check endpoint
$app->get('/api/health', function ($request, $response) {
    $db = Connection::getInstance();
    $dbStatus = $db ? 'connected' : 'disconnected';

    $data = [
        'success' => true,
        'data' => [
            'status' => 'ok',
            'database' => $dbStatus,
            'timestamp' => date('Y-m-d H:i:s'),
        ],
    ];

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

// Run App
$app->run();
