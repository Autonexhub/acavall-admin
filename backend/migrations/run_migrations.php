<?php

/**
 * Database Migration Runner
 *
 * Run this script to set up the database:
 * php migrations/run_migrations.php
 */

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

echo "Acavall Harmony - Database Migration\n";
echo "=====================================\n\n";

try {
    // Connect to MySQL server (without database)
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? 3306;
    $dbname = $_ENV['DB_NAME'] ?? 'acavall_harmony';
    $user = $_ENV['DB_USER'] ?? 'root';
    $pass = $_ENV['DB_PASSWORD'] ?? '';

    echo "Connecting to MySQL server...\n";
    $pdo = new PDO(
        "mysql:host=$host;port=$port;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    // Create database if not exists
    echo "Creating database '$dbname' if not exists...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbname`");

    // Run schema migration
    echo "Running schema migration (001_create_tables.sql)...\n";
    $schema = file_get_contents(__DIR__ . '/001_create_tables.sql');
    $pdo->exec($schema);
    echo "✓ Schema created successfully\n\n";

    // Run seed migration
    echo "Running seed migration (002_seed_data.sql)...\n";
    $seed = file_get_contents(__DIR__ . '/002_seed_data.sql');
    $pdo->exec($seed);
    echo "✓ Seed data inserted successfully\n\n";

    echo "=====================================\n";
    echo "Migration completed successfully!\n\n";
    echo "Default login credentials:\n";
    echo "Email: admin@fundacionacavall.com\n";
    echo "Password: password\n\n";

} catch (PDOException $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
