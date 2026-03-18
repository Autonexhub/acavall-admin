<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/src/Repositories/BaseRepository.php';
require_once __DIR__ . '/src/Repositories/SessionRepository.php';

use App\Repositories\SessionRepository;

echo "Testing SessionRepository::findByDateRange()\n";
echo "===========================================\n\n";

$repo = new SessionRepository();

$startDate = '2026-03-01';
$endDate = '2026-03-31';

echo "Calling findByDateRange('$startDate', '$endDate', [])\n\n";

$sessions = $repo->findByDateRange($startDate, $endDate, []);

echo "Result: " . count($sessions) . " sessions found\n\n";

if (count($sessions) > 0) {
    echo "First session:\n";
    print_r($sessions[0]);
} else {
    echo "No sessions returned!\n";
}

echo "\n\nTesting findAll() for comparison:\n";
$allSessions = $repo->findAll();
echo "findAll() returned: " . count($allSessions) . " sessions\n";
