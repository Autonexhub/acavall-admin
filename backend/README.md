# Acavall Harmony Backend API

PHP REST API backend for Acavall Harmony application built with Slim Framework 4.

## Structure

```
backend/
├── public/
│   └── index.php           # Application entry point
├── src/
│   ├── Controllers/
│   │   └── AuthController.php
│   ├── Infrastructure/
│   │   └── Database/
│   │       └── Connection.php
│   ├── Middleware/
│   │   ├── AuthMiddleware.php
│   │   └── RoleMiddleware.php
│   ├── Repositories/
│   │   ├── BaseRepository.php
│   │   └── UserRepository.php
│   ├── Routes/
│   │   ├── auth.php
│   │   └── ...
│   └── Services/
│       └── JWTService.php
├── .env
└── composer.json
```

## Setup

1. **Install dependencies:**
   ```bash
   composer install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database:**
   ```sql
   CREATE DATABASE acavall_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Run migrations:**
   See `database/schema.sql` for the database schema.

5. **Start development server:**
   ```bash
   php -S localhost:8000 -t public
   ```

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST `/api/auth/logout`
Logout current user (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

### Health Check

#### GET `/api/health`
Check API and database status.

**Response:**
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

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens can be provided in two ways:

1. **Authorization Header:**
   ```
   Authorization: Bearer <token>
   ```

2. **HttpOnly Cookie:**
   ```
   Cookie: auth_token=<token>
   ```

The login endpoint automatically sets an httpOnly cookie for enhanced security.

## Role-Based Access Control

The API implements a role hierarchy system:

- **admin** (level 3) - Full access to all resources
- **coordinator** (level 2) - Access to center and session management
- **therapist** (level 1) - Access to their assigned sessions

Higher roles inherit permissions from lower roles.

### Using RoleMiddleware

```php
use App\Middleware\RoleMiddleware;

$group->get('/admin-only', [$controller, 'method'])
    ->add(new AuthMiddleware())
    ->add(new RoleMiddleware(['admin']));

$group->get('/coordinators-and-admins', [$controller, 'method'])
    ->add(new AuthMiddleware())
    ->add(new RoleMiddleware(['coordinator'])); // Admins can also access
```

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variables

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=acavall_harmony
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters-long
JWT_EXPIRATION=3600
JWT_ISSUER=acavall-harmony

# CORS
CORS_ORIGIN=http://localhost:3000

# Application
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
```

## Development

### Adding New Routes

1. Create controller in `src/Controllers/`
2. Create repository if needed in `src/Repositories/`
3. Define routes in `src/Routes/`
4. Load routes in `public/index.php`

### Database Operations

Use repositories for all database operations. Extend `BaseRepository` for automatic CRUD operations:

```php
class MyRepository extends BaseRepository
{
    protected string $table = 'my_table';

    // Add custom methods here
}
```

## Security Features

- JWT-based authentication
- HttpOnly cookies for token storage
- Password hashing with bcrypt
- Prepared statements for SQL queries
- CORS configuration
- Role-based access control
- Error logging without exposing sensitive data

## License

Proprietary - Acavall Foundation
