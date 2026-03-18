#!/bin/bash

# Acavall Harmony - Database Setup Script
# Runs migrations on production database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Acavall Harmony - Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Create a temporary migration runner for production
echo -e "\n${YELLOW}Creating database and running migrations...${NC}"

# Upload migrations to server
SSH_USER="u353044586"
SSH_HOST="178.16.128.17"
SSH_PORT="65002"
REMOTE_PATH="/home/u353044586/domains/admin.fundacionacavall.com/public_html"

echo "Uploading migration files..."
scp -P $SSH_PORT backend/migrations/*.sql ${SSH_USER}@${SSH_HOST}:${REMOTE_PATH}/migrations/

# Create migration runner on server
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'ENDSSH'
cd /home/u353044586/domains/admin.fundacionacavall.com/public_html

# Create PHP migration runner
cat > run_production_migrations.php << 'EOF'
<?php

/**
 * Production Database Migration Runner
 */

require __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "Acavall Harmony - Database Migration\n";
echo "=====================================\n\n";

try {
    // Connect to MySQL server
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $port = $_ENV['DB_PORT'] ?? 3306;
    $dbname = $_ENV['DB_NAME'] ?? 'u353044586_acavall';
    $user = $_ENV['DB_USER'] ?? 'u353044586_acavall';
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
    $schema = file_get_contents(__DIR__ . '/migrations/001_create_tables.sql');
    $pdo->exec($schema);
    echo "✓ Schema created successfully\n\n";

    // Run seed migration
    echo "Running seed migration (002_seed_data.sql)...\n";
    $seed = file_get_contents(__DIR__ . '/migrations/002_seed_data.sql');
    $pdo->exec($seed);
    echo "✓ Seed data inserted successfully\n\n";

    echo "=====================================\n";
    echo "Migration completed successfully!\n\n";
    echo "Default login credentials:\n";
    echo "Email: admin@acavall.org\n";
    echo "Password: password\n\n";

} catch (PDOException $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
EOF

# Run the migration
echo "Running migrations..."
php run_production_migrations.php

# Clean up
rm run_production_migrations.php

echo "Database setup complete!"
ENDSSH

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Database setup successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nDefault login credentials:"
echo -e "Email: ${GREEN}admin@acavall.org${NC}"
echo -e "Password: ${GREEN}password${NC}"
echo -e "\n${YELLOW}IMPORTANT: Change the admin password after first login!${NC}"
