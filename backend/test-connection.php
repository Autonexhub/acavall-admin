#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Test Database Connection
 *
 * Run this script to verify your database connection is working:
 * php test-connection.php
 */

require __DIR__ . '/vendor/autoload.php';

use App\Infrastructure\Database\Connection;

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "🐴 Acavall Harmony - Database Connection Test\n";
echo str_repeat("=", 50) . "\n\n";

// Test environment variables
echo "Environment Configuration:\n";
echo "  DB_HOST: " . ($_ENV['DB_HOST'] ?? 'NOT SET') . "\n";
echo "  DB_PORT: " . ($_ENV['DB_PORT'] ?? 'NOT SET') . "\n";
echo "  DB_NAME: " . ($_ENV['DB_NAME'] ?? 'NOT SET') . "\n";
echo "  DB_USER: " . ($_ENV['DB_USER'] ?? 'NOT SET') . "\n";
echo "  DB_PASSWORD: " . (isset($_ENV['DB_PASSWORD']) ? '***' : 'NOT SET') . "\n\n";

// Test database connection
try {
    echo "Testing database connection...\n";
    $db = Connection::getInstance();
    echo "✅ Database connection successful!\n\n";

    // Test query
    echo "Running test query...\n";
    $stmt = $db->query("SELECT VERSION() as version");
    $result = $stmt->fetch();
    echo "✅ MySQL Version: " . $result['version'] . "\n\n";

    // Check if users table exists
    echo "Checking tables...\n";
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (count($tables) > 0) {
        echo "✅ Found " . count($tables) . " tables:\n";
        foreach ($tables as $table) {
            echo "   - " . $table . "\n";
        }
        echo "\n";
    } else {
        echo "⚠️  No tables found. Please run database/schema.sql\n\n";
    }

    // Check for admin user
    if (in_array('users', $tables)) {
        $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        $result = $stmt->fetch();
        if ($result['count'] > 0) {
            echo "✅ Admin user found\n";
        } else {
            echo "⚠️  No admin user found. Please run database/schema.sql\n";
        }
    }

    echo "\n" . str_repeat("=", 50) . "\n";
    echo "✅ All checks passed!\n\n";
    echo "You can now start the server:\n";
    echo "  php -S localhost:8000 -t public\n\n";

} catch (PDOException $e) {
    echo "\n❌ Database connection failed!\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "Please check:\n";
    echo "1. MySQL server is running\n";
    echo "2. Database exists (run: CREATE DATABASE " . ($_ENV['DB_NAME'] ?? 'acavall_harmony') . ")\n";
    echo "3. Credentials in .env are correct\n";
    echo "4. User has proper permissions\n\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}
