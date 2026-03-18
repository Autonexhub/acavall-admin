# Acavall Harmony - Hostinger Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables to Update

Before deploying, you need to set these values in `backend/.env.production`:

```bash
# JWT Secret - Generate a strong random key
JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET
```

Also update `.env.production` (root) to match:

```bash
# JWT Secret - Must match backend
JWT_SECRET=YOUR_PRODUCTION_JWT_SECRET
```

### 2. Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

Copy the output and paste it into both:
- `backend/.env.production` as `JWT_SECRET`
- `.env.production` as `JWT_SECRET`

**IMPORTANT**: Both files must have the same JWT_SECRET value!

### 3. Database Credentials

The database credentials are already configured in `backend/.env.production`:

- **Database**: `u353044586_acavall`
- **User**: `u353044586_acavall`
- **Password**: `yDNCL=87b6Q>`

These credentials were provided for the Hostinger deployment.

## Database Setup on Hostinger

### Option A: Fresh Database Setup (Recommended)

If this is a new deployment:

1. Access Hostinger database via cPanel → phpMyAdmin
2. Select database: `u353044586_acavall`
3. Click "Import" tab
4. Upload the database schema/dump file (if you have one)
5. Click "Go"

### Option B: Manual Schema Creation

If you need to create the schema manually:

1. Go to cPanel → phpMyAdmin
2. Select database: `u353044586_acavall`
3. Run the migrations from `backend/migrations/` or create tables manually

You can also run migrations from your local machine by updating your local `.env` to point to the production database temporarily (use with caution).

## Deployment Steps

### Step 1: Generate JWT Secret

```bash
# Generate a secure random key
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"

# Copy the output and update both:
# - backend/.env.production (JWT_SECRET=...)
# - .env.production (JWT_SECRET=...)
```

### Step 2: Verify Production Environment Files

```bash
# Check backend production config
cat backend/.env.production

# Check frontend production config
cat .env.production

# Make sure JWT_SECRET is set and matches in both files
```

### Step 3: Run Pre-Deployment Tests Locally

```bash
# Test backend dependencies
cd backend
composer install --no-dev --optimize-autoloader
cd ..

# Test frontend build
npm install
npm run build
```

### Step 4: Run Deployment Script

```bash
# Make script executable (if not already)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

The script will:
1. ✅ Check SSH connection
2. ✅ Install backend dependencies
3. ✅ Build Next.js frontend
4. ✅ Prepare deployment package
5. ✅ Create server backup
6. ✅ Upload files to Hostinger
7. ✅ Set correct permissions
8. ✅ Verify deployment

### Step 5: Post-Deployment Verification

Visit these URLs to verify:

- **Frontend**: https://admin.fundacionacavall.com
- **API Health**: https://admin.fundacionacavall.com/api/health
- **Login**: https://admin.fundacionacavall.com/login

## Troubleshooting

### Database Connection Errors

If you see database connection errors:

1. Verify database credentials in `.env` on server:
   ```bash
   ssh -p 65002 u353044586@178.16.128.17
   cd domains/admin.fundacionacavall.com/public_html
   cat .env | grep DB_
   ```

2. Test database connection from server:
   ```bash
   php -r "
   \$pdo = new PDO(
     'mysql:host=localhost;dbname=u353044586_acavall',
     'u353044586_acavall',
     'yDNCL=87b6Q>'
   );
   echo 'Connection successful!';
   "
   ```

### API Not Working

1. Check .htaccess exists in root:
   ```bash
   ssh -p 65002 u353044586@178.16.128.17
   cd domains/admin.fundacionacavall.com/public_html
   cat .htaccess
   ```

2. Check PHP version (should be 8.1+):
   ```bash
   php -v
   ```

3. Check logs:
   ```bash
   tail -f logs/app.log
   ```

4. Check error logs in cPanel:
   - Go to cPanel → Errors
   - View recent PHP errors

### Frontend Not Loading

1. Verify files in public directory:
   ```bash
   ls -la public/
   # Should see: index.html, _next/, assets/
   ```

2. Check browser console for errors

3. Verify API_URL in production build:
   ```bash
   grep -r "NEXT_PUBLIC_API_URL" public/_next/*.js
   # Should show: /api
   ```

### JWT Secret Mismatch

If you get authentication errors:

1. Verify JWT_SECRET matches in both files:
   ```bash
   grep JWT_SECRET backend/.env.production
   grep JWT_SECRET .env.production
   ```

2. Both should have the exact same value

## Manual Deployment (if script fails)

### 1. Prepare Files Locally

```bash
# Backend
cd backend
composer install --no-dev --optimize-autoloader
cp .env.production .env
cd ..

# Frontend
npm install
npm run build

# Create package
mkdir -p deploy/public_html
rsync -a backend/ deploy/public_html/ --exclude node_modules --exclude .git --exclude .next
cp backend/.env.production deploy/public_html/.env

# Copy Next.js build
mkdir -p deploy/public_html/public
# Copy your built Next.js files to public/
```

### 2. Upload via FTP/SFTP

Use FileZilla or similar:
- Host: sftp://178.16.128.17
- Port: 65002
- User: u353044586
- Upload `deploy/public_html/` contents to `/home/u353044586/domains/admin.fundacionacavall.com/public_html/`

### 3. Set Permissions via cPanel

File Manager → Select all files:
- Directories: 755
- Files: 644
- .env file: 640

## Database Management

### Accessing Database

**Via phpMyAdmin**:
- cPanel → Databases → phpMyAdmin
- Select: `u353044586_acavall`

**Via Command Line**:
```bash
ssh -p 65002 u353044586@178.16.128.17
mysql -u u353044586_acavall -p u353044586_acavall
# Password: yDNCL=87b6Q>
```

### Backup Database

```bash
# From Hostinger server
ssh -p 65002 u353044586@178.16.128.17
mysqldump -u u353044586_acavall -p u353044586_acavall > backup_$(date +%Y%m%d).sql

# Download backup
scp -P 65002 u353044586@178.16.128.17:backup_*.sql ./
```

### Restore Database

```bash
# Upload backup
scp -P 65002 backup.sql u353044586@178.16.128.17:~/

# Import on server
ssh -p 65002 u353044586@178.16.128.17
mysql -u u353044586_acavall -p u353044586_acavall < backup.sql
```

## Security Checklist

- [ ] `.env` file has restricted permissions (640)
- [ ] Database credentials are secure (already set)
- [ ] JWT secret is random and secure (generated via php command)
- [ ] CORS is limited to production domain (admin.fundacionacavall.com)
- [ ] Debug mode is disabled in production (APP_DEBUG=false)
- [ ] HTTPS is enforced via Hostinger
- [ ] Security headers are set in .htaccess

## Quick Reference

### SSH Connection
```bash
ssh -p 65002 u353044586@178.16.128.17
```

### Deployment Command
```bash
./scripts/deploy.sh
```

### Check Logs
```bash
ssh -p 65002 u353044586@178.16.128.17 "tail -50 /home/u353044586/domains/admin.fundacionacavall.com/public_html/logs/app.log"
```

### Restart PHP (if needed)
Via cPanel → MultiPHP Manager → Select PHP version → Apply

## Project Structure After Deployment

```
/home/u353044586/domains/admin.fundacionacavall.com/public_html/
├── .htaccess                    # Root rewrites (API routing)
├── .env                         # Production environment
├── composer.json
├── vendor/                      # PHP dependencies
├── src/                         # Backend source code
├── public/                      # Web root
│   ├── .htaccess               # Backend API routing
│   ├── index.php               # Backend entry point
│   ├── index.html              # Next.js entry point
│   ├── _next/                  # Next.js static files
│   │   └── static/
│   └── uploads/                # User uploads
└── logs/                        # Application logs
```

## Support

- **Hostinger Support**: Via cPanel live chat
- **Domain**: admin.fundacionacavall.com
- **Server**: Hostinger (178.16.128.17:65002)
- **Database**: u353044586_acavall

---

**Last Updated**: 2026-03-11
**Deployment Target**: admin.fundacionacavall.com
**Server**: Hostinger (178.16.128.17:65002)
