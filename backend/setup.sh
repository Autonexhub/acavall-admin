#!/bin/bash

# Acavall Harmony Backend Setup Script

echo "🐴 Setting up Acavall Harmony Backend..."

# Check if composer is installed
if ! command -v composer &> /dev/null
then
    echo "❌ Composer is not installed. Please install Composer first."
    echo "Visit: https://getcomposer.org/download/"
    exit 1
fi

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials"
else
    echo "✅ .env file already exists"
fi

# Create database directory if it doesn't exist
mkdir -p database

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Create the database: mysql -u root -p < database/schema.sql"
echo "3. Start the server: php -S localhost:8000 -t public"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@acavall.org"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password in production!"
