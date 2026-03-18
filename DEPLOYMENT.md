# Deployment Guide - Acavall Harmony

## Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Ensure all dependencies are installed (`npm install`)
- [ ] Test locally with production-like data

## Deployment Steps

### 1. Database Migration

Run the migration script on your production database:

```bash
mysql -u [username] -p [database_name] < deployment-migration.sql
```

Or execute manually:
- Add `color` column to entities table
- Create `project_entities` junction table
- Migrate centers data to entities

### 2. Backend Deployment

```bash
cd backend
# No new dependencies needed
# Just sync the updated files
```

**Updated Backend Files:**
- `src/Repositories/ProjectRepository.php` - Uses entities instead of centers
- `src/Controllers/ProjectController.php` - Updated for entities
- `src/Controllers/EntityController.php` - Added color field handling
- `src/Repositories/EntityRepository.php` - Already supports color

### 3. Frontend Deployment

```bash
# Install any new dependencies
npm install

# Build for production
npm run build

# The dist folder will contain the production build
# Deploy the contents of the dist folder to your web server
```

**New Frontend Files:**
- `src/components/ui/date-picker.tsx` - New date picker component
- `src/components/ui/date-range-picker.tsx` - New date range picker
- `src/pages/dashboard/ProjectsPage.tsx` - Projects list page
- `src/pages/dashboard/NewProjectPage.tsx` - Create project page
- `src/pages/dashboard/ProjectDetailPage.tsx` - Edit project page
- `src/components/forms/ProjectForm.tsx` - Project form

**Updated Frontend Files:**
- `src/pages/dashboard/SessionsPage.tsx` - URL query params + date picker
- `src/pages/dashboard/EntitiesPage.tsx` - Color indicators + debounced search
- `src/components/forms/ProjectForm.tsx` - Date pickers
- `src/components/therapists/WorkHistorySection.tsx` - Date pickers
- `src/lib/api/queries/useEntities.ts` - keepPreviousData
- `src/lib/validations/schemas.ts` - Updated schemas
- `src/types/models.ts` - Updated interfaces
- `index.html` - New favicon

**New Assets:**
- `public/favicon-32x32.webp`
- `public/favicon-192x192.webp`
- `public/apple-touch-icon.webp`

### 4. Environment Variables

Ensure your production `.env` file has:

```bash
VITE_API_URL=https://your-api-domain.com/api
```

### 5. Post-Deployment Verification

- [ ] Login with admin credentials
- [ ] Verify entities page loads with color indicators
- [ ] Create a test project and verify it saves
- [ ] Create a test session and verify it appears in calendar
- [ ] Test date pickers across different forms
- [ ] Verify search functionality works smoothly
- [ ] Test URL filter persistence in sessions page

## Key Changes Summary

### Database
- ✅ Entities now have `color` field
- ✅ Projects link to entities (not centers)
- ✅ Centers migrated to entities with preserved colors

### Frontend
- ✅ Radix UI date pickers (better UX)
- ✅ URL query params for session filters
- ✅ Debounced search in entities
- ✅ Projects CRUD with entity assignment
- ✅ Updated favicon to Fundación Acavall logo
- ✅ Color indicators throughout the app

### Backend
- ✅ Projects use entities instead of centers
- ✅ Entity controller handles colors
- ✅ Proper pagination response format

## Rollback Plan

If issues occur:

1. **Database Rollback:**
   ```sql
   -- Restore from backup
   -- Or manually revert changes
   ```

2. **Code Rollback:**
   ```bash
   git revert [commit-hash]
   npm run build
   # Redeploy previous version
   ```

## Support

For issues during deployment, check:
- Browser console for JavaScript errors
- Backend logs for API errors
- Database connection and permissions
- CORS settings if API is on different domain
