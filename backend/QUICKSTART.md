# Acavall Harmony Backend - Quick Start Guide

## Prerequisites

- PHP 8.1 or higher
- MySQL 5.7 or higher / MariaDB 10.3 or higher
- Composer
- Git

## Installation Steps

### 1. Install Dependencies

```bash
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=acavall_harmony
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters-long
```

### 3. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE acavall_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 4. Import Schema

```bash
mysql -u root -p acavall_harmony < database/schema.sql
```

### 5. Test Connection

```bash
php test-connection.php
```

You should see:
```
✅ Database connection successful!
✅ MySQL Version: X.X.X
✅ Found X tables
✅ Admin user found
```

### 6. Start Development Server

```bash
php -S localhost:8000 -t public
```

### 7. Test API

Open another terminal:

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "2026-02-27 17:45:00"
  }
}
```

### 8. Test Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acavall.org","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@acavall.org",
      "name": "Admin User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Default Credentials

**Admin User:**
- Email: `admin@acavall.org`
- Password: `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login in production!

## Project Structure

```
backend/
├── public/              # Web server document root
│   └── index.php       # Application entry point
├── src/
│   ├── Controllers/    # Request handlers
│   ├── Infrastructure/ # Database connection
│   ├── Middleware/     # Auth & role middleware
│   ├── Repositories/   # Database operations
│   ├── Routes/         # API route definitions
│   └── Services/       # Business logic (JWT, etc.)
├── database/           # Database schema
├── .env               # Environment configuration (DO NOT COMMIT)
└── composer.json      # PHP dependencies
```

## Key Features

### Authentication System
- JWT-based authentication
- HttpOnly cookie support
- Token expiration handling
- Password hashing with bcrypt

### Role-Based Access Control
- Admin (full access)
- Coordinator (center & session management)
- Therapist (assigned sessions only)

### Security Features
- Prepared statements (SQL injection prevention)
- CORS configuration
- Error logging
- Password hashing
- HttpOnly cookies

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `GET /api/health` - Health check

### Protected Endpoints (Require Authentication)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## Testing Tools

### 1. cURL (Command Line)
See examples in API_DOCUMENTATION.md

### 2. REST Client (VS Code)
Use `test-api.http` file with REST Client extension

### 3. Postman
Import endpoints manually or use provided examples

### 4. Browser
Navigate to:
- http://localhost:8000/api/health (GET)

## Common Issues

### Connection Refused
**Problem:** Can't connect to MySQL

**Solution:**
```bash
# Check MySQL is running
sudo service mysql status

# Start MySQL
sudo service mysql start
```

### Database Not Found
**Problem:** `Unknown database 'acavall_harmony'`

**Solution:**
```sql
CREATE DATABASE acavall_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Access Denied
**Problem:** MySQL access denied for user

**Solution:**
```sql
# Grant privileges
GRANT ALL PRIVILEGES ON acavall_harmony.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Composer Not Found
**Problem:** `composer: command not found`

**Solution:**
Install Composer: https://getcomposer.org/download/

### Port Already in Use
**Problem:** Port 8000 is already in use

**Solution:**
```bash
# Use a different port
php -S localhost:8001 -t public
```

## Development Workflow

### 1. Add New Endpoint

**Create Controller:**
```php
// src/Controllers/MyController.php
namespace App\Controllers;

class MyController {
    public function myMethod($request, $response) {
        return $this->jsonResponse($response, [
            'success' => true,
            'data' => ['message' => 'Hello']
        ]);
    }
}
```

**Create Repository (if needed):**
```php
// src/Repositories/MyRepository.php
namespace App\Repositories;

class MyRepository extends BaseRepository {
    protected string $table = 'my_table';
}
```

**Add Routes:**
```php
// src/Routes/my_routes.php
$app->group('/api/my-resource', function ($group) {
    $controller = new MyController();

    $group->get('', [$controller, 'myMethod'])
        ->add(new AuthMiddleware());
});
```

**Load Routes in index.php:**
```php
require __DIR__ . '/../src/Routes/my_routes.php';
```

### 2. Protect Routes

**Require Authentication:**
```php
$group->get('/protected', [$controller, 'method'])
    ->add(new AuthMiddleware());
```

**Require Specific Role:**
```php
$group->get('/admin-only', [$controller, 'method'])
    ->add(new AuthMiddleware())
    ->add(new RoleMiddleware(['admin']));
```

### 3. Database Operations

**Using Repository:**
```php
$repository = new MyRepository();

// Find all
$items = $repository->findAll();

// Find by ID
$item = $repository->findById(1);

// Create
$id = $repository->create(['name' => 'Test']);

// Update
$repository->update(1, ['name' => 'Updated']);

// Delete
$repository->delete(1);
```

## Next Steps

1. ✅ Backend is set up and running
2. 📝 Review API_DOCUMENTATION.md for detailed API docs
3. 🔧 Customize .env for your environment
4. 🔒 Change default admin password
5. 🚀 Start building your frontend
6. 📊 Add additional endpoints as needed

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`

For full project documentation, see `README.md`

## License

Proprietary - Acavall Foundation
