# Claude AI Assistant Notes

## ⚠️ CRITICAL DEPLOYMENT RULE

**NEVER DEPLOY TO PRODUCTION WITHOUT EXPLICIT USER PERMISSION**

- Do NOT run `bash scripts/deploy.sh` unless the user explicitly says "deploy"
- Always test changes locally first
- Wait for user approval before pushing to production
- If changes are ready, inform the user and ASK if they want to deploy

## Deployment Process

1. Make changes locally
2. Test locally (localhost:3000 for frontend, localhost:8000 for backend)
3. Build locally to verify (`npm run build`)
4. Inform user of changes and results
5. **WAIT for explicit "deploy" command**
6. Only then run deployment script

## Project Information

- **Production URL**: https://admin.fundacionacavall.com
- **Database**: u353044586_acavall (Hostinger)
- **SSH**: u353044586@178.16.128.17:65002
- **Local DB**: acavall_harmony (root, no password)

## Branding

- **Primary Color**: Yellow HSL(51, 85%, 60%)
- **Logo**: src/assets/logo-acavall.png
- **Name**: Fundación Acavall
- **Email Domain**: @fundacionacavall.com

## Backend Field Mappings

### Centers
- name, address, responsible, schedule, frequency, color

### Therapists
- name, specialty, email, phone

### Sessions
- date, center_id, start_time, end_time, hours, participants, type, notes, created_by

### Residences
- name, status, total_sessions, total_days, program_id
