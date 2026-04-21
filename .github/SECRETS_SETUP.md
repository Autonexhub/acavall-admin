# GitHub Secrets Setup for Acavall Admin

## Required Repository Secrets

Go to: **Settings → Secrets and variables → Actions → Repository secrets**

### SSH Access (can reuse from marta-backend)
| Secret | Description | Example |
|--------|-------------|---------|
| `HOSTINGER_SSH_PRIVATE_KEY` | SSH private key for deployment | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### Database
| Secret | Description | Value |
|--------|-------------|-------|
| `DB_HOST` | Database host | `localhost` |
| `DB_NAME` | Database name | `u353044586_acavall` |
| `DB_USER` | Database user | `u353044586_acavall` |
| `DB_PASSWORD` | Database password | (your password) |

### JWT Authentication
| Secret | Description | How to generate |
|--------|-------------|-----------------|
| `JWT_SECRET` | 64-char secret key | `php -r "echo bin2hex(random_bytes(32));"` |

### SMTP Email
| Secret | Description | Value |
|--------|-------------|-------|
| `SMTP_HOST` | SMTP server | `smtp.hostinger.com` |
| `SMTP_PORT` | SMTP port | `465` |
| `SMTP_SECURE` | Use SSL | `true` |
| `SMTP_USER` | SMTP username | `noreply@fundacionacavall.com` |
| `SMTP_PASS` | SMTP password | (your password) |

## Optional Repository Variables

Go to: **Settings → Secrets and variables → Actions → Repository variables**

| Variable | Description | Value |
|----------|-------------|-------|
| `DISCORD_WEBHOOK_URL` | Discord notifications | (webhook URL) |

## Quick Setup Commands

### Generate JWT Secret
```bash
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

### Test SSH Connection
```bash
ssh -p 65002 u353044586@178.16.128.17 "echo 'Connection successful'"
```

### Verify Database
```bash
mysql -h localhost -u u353044586_acavall -p u353044586_acavall -e "SHOW TABLES;"
```

## Deployment Triggers

The workflow deploys automatically when:
- **Push to `main` branch** - auto deploy to production
- **Manual trigger** - go to Actions → Deploy to Production → Run workflow

## Rollback

Backups are stored in `/home/u353044586/backups/` (keeps last 5).

To rollback:
```bash
ssh -p 65002 u353044586@178.16.128.17
cd /home/u353044586/domains/admin.fundacionacavall.com
mv public_html public_html_broken
tar -xzf ~/backups/backup-YYYYMMDD-HHMMSS.tar.gz
mv public_html_backup public_html
```
