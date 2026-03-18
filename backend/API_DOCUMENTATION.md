# Acavall Harmony API Documentation

## Base URL
```
http://localhost:8000/api
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or token invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication

### POST `/auth/login`
Authenticate user and receive JWT token.

**Public endpoint** - No authentication required

**Request Body:**
```json
{
  "email": "admin@acavall.org",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@acavall.org",
      "name": "Admin User",
      "role": "admin",
      "phone": null,
      "active": true,
      "created_at": "2026-02-27 10:00:00",
      "updated_at": "2026-02-27 10:00:00"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

**Cookie Set:**
The endpoint automatically sets an HttpOnly cookie named `auth_token` with the JWT token.

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acavall.org","password":"admin123"}' \
  -c cookies.txt
```

---

### POST `/auth/logout`
Logout current user and clear authentication cookie.

**Protected endpoint** - Requires authentication

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "No token provided"
}
```

**Cookie Clear:**
The endpoint clears the `auth_token` cookie.

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -b cookies.txt \
  -c cookies.txt
```

---

### GET `/auth/me`
Get current authenticated user information.

**Protected endpoint** - Requires authentication

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@acavall.org",
    "name": "Admin User",
    "role": "admin",
    "phone": null,
    "active": true,
    "created_at": "2026-02-27 10:00:00",
    "updated_at": "2026-02-27 10:00:00"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Health Check

### GET `/health`
Check API and database connection status.

**Public endpoint** - No authentication required

**Success Response (200):**
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

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/health
```

---

## Authentication Methods

The API supports two methods of providing the JWT token:

### 1. Authorization Header (Recommended)
```
Authorization: Bearer <token>
```

**JavaScript Example:**
```javascript
fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### 2. Cookie (Automatic)
The login endpoint automatically sets an HttpOnly cookie named `auth_token`. Subsequent requests will include this cookie automatically.

**JavaScript Example:**
```javascript
fetch('http://localhost:8000/api/auth/me', {
  credentials: 'include'
})
```

---

## User Roles

The API implements three user roles with hierarchical permissions:

| Role | Level | Description |
|------|-------|-------------|
| `admin` | 3 | Full system access |
| `coordinator` | 2 | Can manage centers and sessions |
| `therapist` | 1 | Can view and manage assigned sessions |

**Role Hierarchy:**
- Admins can access all coordinator and therapist endpoints
- Coordinators can access all therapist endpoints
- Therapists have the most restricted access

---

## Error Handling

### Common Error Scenarios

**Missing Token:**
```json
{
  "success": false,
  "error": "No token provided"
}
```

**Invalid/Expired Token:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Insufficient Permissions:**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**Database Error:**
```json
{
  "success": false,
  "error": "Database error occurred"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting middleware.

---

## CORS Configuration

The API includes CORS middleware that can be configured via the `CORS_ORIGIN` environment variable.

**Default Development Setting:**
```env
CORS_ORIGIN=http://localhost:3000
```

**Production Setting:**
```env
CORS_ORIGIN=https://yourdomain.com
```

**All Origins (Not Recommended for Production):**
```env
CORS_ORIGIN=*
```

---

## Testing with Postman

1. Import the endpoints into Postman
2. Create an environment with variables:
   - `baseUrl`: `http://localhost:8000/api`
   - `token`: (will be set after login)

3. Login to get token:
   ```
   POST {{baseUrl}}/auth/login
   Body: {"email":"admin@acavall.org","password":"admin123"}
   ```

4. Save the token from response:
   ```javascript
   // In Postman Tests tab
   const response = pm.response.json();
   if (response.success && response.data.token) {
     pm.environment.set("token", response.data.token);
   }
   ```

5. Use token in other requests:
   ```
   Authorization: Bearer {{token}}
   ```

---

## Development Testing

Use the included `test-api.http` file with VS Code REST Client extension:

1. Install REST Client extension in VS Code
2. Open `test-api.http`
3. Click "Send Request" above each request

---

## Security Best Practices

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Change default admin password** - Immediately after setup
3. **Use strong JWT secret** - Minimum 32 characters
4. **Enable HTTPS in production** - Use SSL/TLS certificates
5. **Set appropriate CORS origin** - Don't use `*` in production
6. **Regular security updates** - Keep dependencies updated
7. **Monitor logs** - Check for suspicious activity
8. **Implement rate limiting** - Prevent brute force attacks
9. **Use environment-specific configs** - Different settings for dev/prod
10. **Backup database regularly** - Prevent data loss

---

## Support

For issues or questions, contact the development team.

## License

Proprietary - Acavall Foundation
