# Email Notifications and Password Reset Implementation

## Overview
This document describes the implementation of email notifications for new user accounts and the password reset system for Fundación Acavall.

## Features Implemented

### 1. Password Reset System
- Users can request a password reset via email
- Secure token-based reset flow with 1-hour expiration
- Email sent with reset link
- Token validation before password change
- Tokens are marked as used after successful password reset

### 2. Welcome Email Notifications
- Automatic email sent when creating new therapist user accounts
- Email includes login credentials
- Encourages users to change password after first login

## Files Created

### Frontend
- `src/pages/auth/ForgotPasswordPage.tsx` - Form to request password reset
- `src/pages/auth/ResetPasswordPage.tsx` - Form to reset password with token validation

### Backend
- `backend/src/Services/EmailService.php` - Email sending service with templates
- `backend/migrations/008_create_password_reset_tokens.sql` - Database table for reset tokens

### Modified Files
- `src/pages/auth/LoginPage.tsx` - Added "Forgot Password?" link
- `src/App.tsx` - Added routes for forgot-password and reset-password
- `backend/src/Controllers/AuthController.php` - Added password reset endpoints
- `backend/src/Routes/auth.php` - Added password reset routes
- `backend/src/Controllers/TherapistController.php` - Added welcome email sending
- `backend/.env` - Added email configuration
- `backend/.env.example` - Added email configuration template

## API Endpoints

### Public Endpoints (No authentication required)

#### POST /api/auth/forgot-password
Request password reset email
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/verify-reset-token
Verify if a reset token is valid
```json
{
  "token": "abc123..."
}
```

#### POST /api/auth/reset-password
Reset password with token
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

## Database Schema

### password_reset_tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
)
```

## Email Templates

### Password Reset Email
- Subject: "Restablece tu contraseña - Fundación Acavall"
- Contains: Reset link with 1-hour expiration
- Both HTML and plain text versions

### Welcome Email
- Subject: "Bienvenido a Fundación Acavall"
- Contains: Login credentials, link to login page
- Security reminder to change password
- Both HTML and plain text versions

## Configuration

### Environment Variables (.env)
```bash
# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Configuration
MAIL_FROM_ADDRESS=noreply@fundacionacavall.com
MAIL_FROM_NAME=Fundación Acavall
```

### Production Configuration
For production deployment, update the following in the production .env file:
```bash
FRONTEND_URL=https://admin.fundacionacavall.com
MAIL_FROM_ADDRESS=noreply@fundacionacavall.com
MAIL_FROM_NAME=Fundación Acavall
```

## User Flow

### Password Reset Flow
1. User clicks "¿Olvidaste tu contraseña?" on login page
2. User enters email address
3. System sends reset email (if email exists)
4. User clicks link in email
5. User enters new password (with confirmation)
6. Password is updated
7. User is redirected to login

### New Account Flow
1. Admin creates therapist with "Create User Account" option enabled
2. System creates user account with specified password
3. System sends welcome email with credentials
4. New user receives email with login link
5. User logs in with provided credentials
6. User should change password after first login

## Security Features

1. **Token Security**
   - Cryptographically secure random tokens (64 characters)
   - 1-hour expiration time
   - Single-use tokens (marked as used)
   - Unique token constraint in database

2. **Email Enumeration Prevention**
   - Same response returned whether email exists or not
   - Prevents attackers from discovering valid email addresses

3. **Password Requirements**
   - Minimum 6 characters
   - Hashed using bcrypt
   - Password confirmation required

## Testing

### Local Testing
1. Run migration: `mysql -u root acavall_harmony < backend/migrations/008_create_password_reset_tokens.sql`
2. Start backend: `cd backend && php -S localhost:8000 -t public`
3. Start frontend: `npm run dev`
4. Test forgot password flow at http://localhost:3000/forgot-password

### Email Testing
The EmailService uses PHP's `mail()` function. For local testing:
- Configure local mail server (e.g., MailHog, Postfix)
- Or check error logs for email content
- Production server should have mail configured

## Deployment Notes

### Steps to Deploy
1. Run the database migration on production:
   ```bash
   mysql -u u353044586_acavall -p u353044586_acavall < migrations/008_create_password_reset_tokens.sql
   ```

2. Update production .env file with:
   ```bash
   FRONTEND_URL=https://admin.fundacionacavall.com
   MAIL_FROM_ADDRESS=noreply@fundacionacavall.com
   MAIL_FROM_NAME=Fundación Acavall
   ```

3. Deploy frontend and backend files

4. Verify email functionality works on production server

## Troubleshooting

### Emails Not Sending
- Check PHP mail() configuration on server
- Check error logs: `/var/log/mail.log` or PHP error logs
- Verify MAIL_FROM_ADDRESS and MAIL_FROM_NAME in .env
- Contact hosting provider about mail configuration

### Token Invalid Error
- Check if token has expired (1 hour limit)
- Verify password_reset_tokens table exists
- Check database connection

### Links Not Working
- Verify FRONTEND_URL is set correctly in .env
- Check that routes are registered in frontend

## Future Enhancements

Potential improvements:
- SMTP configuration for more reliable email delivery
- Email templates customization via admin panel
- Email delivery tracking and logging
- Multi-factor authentication
- Password strength requirements configuration
- Rate limiting for password reset requests
