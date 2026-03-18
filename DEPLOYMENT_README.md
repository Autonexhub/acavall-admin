# Deployment Setup for Acavall Harmony

This document provides a quick overview of the deployment setup for the Acavall Harmony project to Hostinger.

## Files Created

The following files have been created for deployment:

1. **`backend/.env.production`** - Backend production environment configuration
2. **`.env.production`** - Next.js frontend production environment configuration
3. **`scripts/deploy.sh`** - Automated deployment script
4. **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide with troubleshooting
5. **`DEPLOYMENT_CHECKLIST.md`** - Step-by-step checklist for deployments

## Quick Start

### 1. Generate JWT Secret

First, generate a secure JWT secret:

```bash
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

### 2. Update Environment Files

Update the JWT_SECRET in both files with the generated value:

- `backend/.env.production` → Set `JWT_SECRET=<your-generated-secret>`
- `.env.production` → Set `JWT_SECRET=<your-generated-secret>`

**Important**: Both files must have the **same** JWT_SECRET!

### 3. Deploy

Run the deployment script:

```bash
./scripts/deploy.sh
```

The script will automatically:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Build the frontend
- ✅ Create a backup on the server
- ✅ Deploy all files
- ✅ Set correct permissions
- ✅ Verify the deployment

## Deployment Target

- **Domain**: https://admin.fundacionacavall.com
- **Server**: Hostinger (178.16.128.17:65002)
- **SSH User**: u353044586
- **Database**: u353044586_acavall (credentials already configured)

## Project Structure

This is a hybrid Next.js + PHP backend project:

- **Frontend**: Next.js (React) - Deployed to `/public/`
- **Backend**: PHP/Slim API - Deployed to root with API routes at `/api/*`
- **Database**: MySQL on Hostinger

## Architecture

```
admin.fundacionacavall.com/
├── Frontend (Next.js)
│   └── Routes: /, /login, /dashboard, etc.
│
└── Backend API (PHP/Slim)
    └── Routes: /api/*, /api/health
```

All requests to `/api/*` are routed to the PHP backend via `.htaccess` rewrite rules.

## Important Notes

1. **Database Credentials**: Already configured in `backend/.env.production`
   - Database: `u353044586_acavall`
   - User: `u353044586_acavall`
   - Password: `yDNCL=87b6Q>`

2. **Security**:
   - Production `.env` files are in `.gitignore` to prevent committing secrets
   - JWT secret must be strong (min 32 characters)
   - APP_DEBUG is set to false in production

3. **Backup**:
   - The deploy script creates automatic backups before each deployment
   - Backups are stored in `/home/u353044586/backups/` on the server

4. **Verification**:
   - Frontend: https://admin.fundacionacavall.com
   - API Health: https://admin.fundacionacavall.com/api/health

## Next Steps

1. **Before First Deployment**:
   - [ ] Generate and set JWT_SECRET in both `.env.production` files
   - [ ] Ensure database schema is created on Hostinger
   - [ ] Test SSH connection to server

2. **First Deployment**:
   - [ ] Follow the checklist in `DEPLOYMENT_CHECKLIST.md`
   - [ ] Run `./scripts/deploy.sh`
   - [ ] Verify all endpoints work

3. **After Deployment**:
   - [ ] Test login functionality
   - [ ] Verify API endpoints
   - [ ] Check error logs for issues

## Getting Help

- **Full Guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Checklist**: Use `DEPLOYMENT_CHECKLIST.md` for deployment steps
- **SSH Access**: `ssh -p 65002 u353044586@178.16.128.17`
- **Hostinger Support**: Available via cPanel live chat

## Comparison with marta-backend

This deployment setup is based on the `marta-backend` project structure:

| Feature | marta-backend | acavall-harmony |
|---------|---------------|-----------------|
| Frontend | React (Vite) | Next.js |
| Backend | PHP/Slim | PHP/Slim |
| Server | Hostinger | Hostinger |
| Domain | app.autonexhub.es | admin.fundacionacavall.com |
| Database | u353044586_marta_backend | u353044586_acavall |
| Structure | Monorepo | Monorepo |
| Deployment | deploy.sh script | deploy.sh script |

Both projects use the same deployment pattern and server infrastructure.

---

**Created**: 2026-03-11
**Based on**: marta-backend deployment structure
