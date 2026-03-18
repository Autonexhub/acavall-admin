# Setup Guide - Acavall Harmony

Complete setup instructions for development and production environments.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18.0 or higher
- **Bun** 1.1.0 or higher
- **PHP** 8.1 or higher
- **Composer** 2.0 or higher
- **MySQL** 8.0 or higher (or MariaDB 10.6+)
- **Git**

## 🚀 Quick Start (Development)

### Step 1: Clone and Install Frontend

```bash
# Clone repository (if not already done)
cd /Users/marcosriganti/Projects/acavall-harmony-next

# Install frontend dependencies
bun install

# Copy environment file
cp .env.local.example .env.local
```

### Step 2: Configure Frontend Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

### Step 3: Install Backend Dependencies

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env
```

### Step 4: Configure Backend Environment

Edit `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=acavall_harmony
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT (must match frontend JWT_SECRET)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRATION=3600
JWT_ISSUER=acavall-harmony

# CORS (frontend URL)
CORS_ORIGIN=http://localhost:3000

# App
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### Step 5: Create Database

```bash
# Option 1: Run migration script (recommended)
cd backend
php migrations/run_migrations.php

# Option 2: Manual MySQL
mysql -u root -p
CREATE DATABASE acavall_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE acavall_harmony;
SOURCE migrations/001_create_tables.sql;
SOURCE migrations/002_seed_data.sql;
EXIT;
```

### Step 6: Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
php -S localhost:8000 -t public
```

**Terminal 2 - Frontend:**
```bash
cd /Users/marcosriganti/Projects/acavall-harmony-next
bun run dev
```

### Step 7: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/api/health

**Login with:**
- Email: `admin@acavall.org`
- Password: `password`

---

## 🔒 Security Notes

### Change Default Credentials

After first login, you should:

1. Change the admin password
2. Generate a secure JWT_SECRET:
   ```bash
   # Generate random 32-character string
   openssl rand -base64 32
   ```
3. Update both `.env` files with the new JWT_SECRET

### Production JWT Secret

For production, generate a strong secret:

```bash
php -r "echo bin2hex(random_bytes(32));"
```

---

## 🌐 Production Deployment

### Hostinger Deployment

#### 1. Prepare Files

```bash
# Build frontend
bun run build

# This creates `.next/` directory with production build
```

#### 2. Backend Setup on Hostinger

1. **Upload Backend:**
   - Upload entire `backend/` folder to `public_html/api/`
   - Or use Git deployment if available

2. **Install Dependencies:**
   ```bash
   cd public_html/api
   composer install --no-dev --optimize-autoloader
   ```

3. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update with production database credentials from cPanel
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Update `CORS_ORIGIN` to your frontend domain

4. **Run Migrations:**
   ```bash
   php migrations/run_migrations.php
   ```

5. **Verify .htaccess:**
   Ensure `public/.htaccess` exists with correct rewrite rules.

#### 3. Frontend Setup

**Option A: Deploy to Vercel (Recommended)**

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   JWT_SECRET=your-production-secret
   ```
4. Deploy

**Option B: Deploy to Hostinger**

1. Upload `.next/` build folder to `public_html/`
2. Upload `public/`, `package.json`, `next.config.js`
3. Install Node.js from cPanel (if available)
4. Run `npm install --production`
5. Configure `.htaccess` for Next.js routing

---

## 🔍 Troubleshooting

### Database Connection Failed

**Error**: `SQLSTATE[HY000] [2002] Connection refused`

**Solution**:
1. Check MySQL is running: `mysql -u root -p`
2. Verify credentials in `.env`
3. Ensure database exists: `SHOW DATABASES;`

### CORS Errors

**Error**: `Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy`

**Solution**:
1. Check `CORS_ORIGIN` in backend `.env` matches frontend URL exactly
2. Restart backend server after changing `.env`
3. Clear browser cache

### JWT Token Invalid

**Error**: `401 Unauthorized` on protected routes

**Solution**:
1. Ensure `JWT_SECRET` is **identical** in both frontend and backend `.env` files
2. Clear browser cookies
3. Login again

### Migration Errors

**Error**: `Table already exists`

**Solution**:
```bash
# Drop and recreate database
mysql -u root -p
DROP DATABASE acavall_harmony;
CREATE DATABASE acavall_harmony CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations again
php migrations/run_migrations.php
```

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
php -S localhost:8001 -t public
```

---

## 📊 Verifying Installation

Run these checks to ensure everything works:

### 1. Backend Health Check
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
    "timestamp": "2025-01-15 10:30:00"
  }
}
```

### 2. Login Test
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acavall.org","password":"password"}'
```

Expected: JWT token in response and cookie set.

### 3. Frontend Build Test
```bash
bun run build
```

Expected: No errors, `.next/` directory created.

---

## 🔄 Updating

### Pull Latest Changes

```bash
git pull origin main

# Update frontend dependencies
bun install

# Update backend dependencies
cd backend
composer install

# Run any new migrations
php migrations/run_migrations.php
```

---

## 📝 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Frontend: Edit files in `src/`
   - Backend: Edit files in `backend/src/`

3. **Test Locally**
   - Start both servers
   - Test in browser
   - Check API responses

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🛠️ Useful Commands

### Frontend
```bash
# Development server
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Type check
bun run type-check
```

### Backend
```bash
# Development server
php -S localhost:8000 -t public

# Run migrations
php migrations/run_migrations.php

# Install dependencies
composer install

# Update dependencies
composer update

# Clear logs
rm -rf logs/*.log
```

### Database
```bash
# MySQL CLI
mysql -u root -p acavall_harmony

# Dump database
mysqldump -u root -p acavall_harmony > backup.sql

# Restore database
mysql -u root -p acavall_harmony < backup.sql

# Check tables
mysql -u root -p -e "USE acavall_harmony; SHOW TABLES;"
```

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review logs in `backend/logs/`
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

## ✅ Setup Checklist

- [ ] Node.js, Bun, PHP, Composer, MySQL installed
- [ ] Repository cloned
- [ ] Frontend dependencies installed (`bun install`)
- [ ] Backend dependencies installed (`composer install`)
- [ ] Environment files created and configured
- [ ] Database created and migrated
- [ ] Both servers running
- [ ] Can access http://localhost:3000
- [ ] Can login with default credentials
- [ ] Can see dashboard with data

If all checkboxes are checked, your setup is complete! 🎉
