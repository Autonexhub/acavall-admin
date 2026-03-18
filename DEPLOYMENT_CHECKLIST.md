# Deployment Checklist for Acavall Harmony

Use this checklist before deploying to production.

## Pre-Deployment

### 1. Generate JWT Secret
- [ ] Generate JWT secret: `php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"`
- [ ] Update `backend/.env.production` with JWT_SECRET
- [ ] Update `.env.production` with same JWT_SECRET
- [ ] Verify both JWT secrets match

### 2. Verify Environment Files
- [ ] Check `backend/.env.production` exists
- [ ] Check `.env.production` exists
- [ ] Verify database credentials are correct:
  - DB_NAME: u353044586_acavall
  - DB_USER: u353044586_acavall
  - DB_PASSWORD: yDNCL=87b6Q>
- [ ] Verify APP_DEBUG=false
- [ ] Verify APP_ENV=production
- [ ] Verify CORS_ORIGIN=https://admin.fundacionacavall.com

### 3. Database Setup
- [ ] Database `u353044586_acavall` exists on Hostinger
- [ ] Database schema is created (tables exist)
- [ ] Test data is seeded (if needed)
- [ ] Database backup is created (if updating existing)

### 4. Local Testing
- [ ] Backend dependencies install: `cd backend && composer install --no-dev`
- [ ] Frontend builds successfully: `npm run build`
- [ ] No build errors or warnings
- [ ] API endpoints work locally
- [ ] Frontend connects to backend locally

### 5. SSH Access
- [ ] SSH credentials work: `ssh -p 65002 u353044586@178.16.128.17`
- [ ] Can access the deployment directory
- [ ] Have necessary permissions

## Deployment

### 6. Run Deployment Script
- [ ] Make script executable: `chmod +x scripts/deploy.sh`
- [ ] Run deployment: `./scripts/deploy.sh`
- [ ] Deployment completes without errors
- [ ] Backup is created on server

## Post-Deployment

### 7. Verify Deployment
- [ ] Visit https://admin.fundacionacavall.com (frontend loads)
- [ ] Visit https://admin.fundacionacavall.com/api/health (returns success)
- [ ] Login page loads correctly
- [ ] Can log in with test credentials
- [ ] API calls work from frontend
- [ ] No console errors in browser

### 8. Security Checks
- [ ] `.env` file has restricted permissions (640)
- [ ] Debug mode is disabled (check response headers)
- [ ] HTTPS is working (check for SSL certificate)
- [ ] API only accepts requests from correct origin
- [ ] Database credentials are not exposed

### 9. Functionality Tests
- [ ] Authentication works (login/logout)
- [ ] Protected routes require authentication
- [ ] JWT tokens are issued correctly
- [ ] Can create/read/update/delete resources
- [ ] All main features work as expected

### 10. Monitoring
- [ ] Check error logs: `tail -f logs/app.log`
- [ ] No unexpected errors in logs
- [ ] Set up monitoring/alerting (if applicable)
- [ ] Document any deployment issues

## Rollback Plan (if needed)

If deployment fails:

1. **Restore from backup**:
   ```bash
   ssh -p 65002 u353044586@178.16.128.17
   cd ~/backups
   ls -la  # Find your backup
   cp -r backup-YYYYMMDD-HHMMSS/* /home/u353044586/domains/admin.fundacionacavall.com/public_html/
   ```

2. **Restore database** (if database was changed):
   ```bash
   mysql -u u353044586_acavall -p u353044586_acavall < backup.sql
   ```

3. **Check logs** to understand what went wrong:
   ```bash
   tail -100 /home/u353044586/domains/admin.fundacionacavall.com/public_html/logs/app.log
   ```

## Notes

- Deployment creates automatic backup: `backup-YYYYMMDD-HHMMSS`
- Backups are stored in: `/home/u353044586/backups/`
- Always test locally before deploying
- Deploy during low-traffic times if possible
- Keep a list of deployment times and versions

## Deployment Log

| Date | Version | Deployed By | Status | Notes |
|------|---------|-------------|--------|-------|
| 2026-03-11 | 1.0.0 | Initial | Pending | First deployment |
|  |  |  |  |  |
|  |  |  |  |  |

---

**Next Deployment Date**: TBD
**Responsible**: [Your Name]
**Emergency Contact**: [Contact Info]
