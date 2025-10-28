# Production Security Checklist

## ✅ Completed Before Production

### Authentication & Secrets
- [ ] **Generate strong NEXTAUTH_SECRET** (minimum 32 characters)
  ```bash
  # Generate in terminal:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  - Update in Vercel: `Settings → Environment Variables → NEXTAUTH_SECRET`
  
- [ ] **Update NEXTAUTH_URL to production domain**
  ```
  NEXTAUTH_URL=https://your-app.vercel.app
  ```

- [ ] **Rotate all demo/placeholder credentials**
  - Database passwords
  - API keys (Resend, etc.)
  - SMTP passwords

### Rate Limiting
- [ ] **Add rate limiting middleware** (see implementation below)
  - Auth routes: 5 attempts per 15 minutes
  - API routes: 100 requests per minute per IP
  - Public pages: 1000 requests per minute

### Security Headers
- [ ] **Add security headers** to `next.config.ts`:
  - Content-Security-Policy (CSP)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy

### Input Validation & Sanitization
- [ ] **Email template HTML sanitization**
  - Install DOMPurify or similar
  - Sanitize all user-provided HTML before saving
  
- [ ] **Validate all API inputs**
  - Use Zod schemas for validation
  - Check email formats, URLs, etc.

### Session Security
- [ ] **Review NextAuth session config**
  - Set appropriate `maxAge` (default 30 days is fine)
  - Enable `updateAge` for sliding sessions
  - Use `secure: true` cookies in production

### CORS & API Protection
- [ ] **Review CORS settings** (currently open)
  - Restrict origins to your domain
  - Only allow necessary HTTP methods

### Email Security
- [ ] **Verify email sending domain**
  - Add SPF, DKIM, DMARC records
  - Use verified sender addresses only

### Database
- [ ] **Enable connection pooling** (Prisma Accelerate ✅ already using)
- [ ] **Review Prisma query permissions**
- [ ] **Enable automatic backups** (Vercel Postgres handles this)

## 🔍 Security Audit Items

### API Routes - Authorization Check
Go through each route and verify:
- ✅ Session check exists
- ✅ Organization isolation enforced
- ✅ Role-based access control (ADMIN for sensitive ops)

Routes to audit:
- `/api/auth/register` - ✅ Creates user properly
- `/api/organizations` - ✅ Filters by org
- `/api/orders` - ✅ Filters by org
- `/api/email-templates` - ✅ Filters by org, ADMIN for write
- `/api/settings/email` - ✅ ADMIN only

### Error Messages
- [ ] Don't expose stack traces in production
- [ ] Use generic error messages for auth failures
- [ ] Log detailed errors server-side only

### Dependencies
- [ ] Run `npm audit` and fix critical/high vulnerabilities
- [ ] Keep dependencies updated monthly
- [ ] Use Dependabot or Snyk for alerts

## 🚀 Deployment Checklist

### Vercel Configuration
- [ ] Set all environment variables in Production
- [ ] Enable automatic deployments from `main` branch
- [ ] Set up Preview deployments for PRs
- [ ] Configure custom domain with SSL

### Monitoring & Logging
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Enable Vercel Analytics
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure log retention

### Testing
- [ ] Test all auth flows in production environment
- [ ] Verify email sending works
- [ ] Test SMTP/Resend configuration
- [ ] Verify all API routes return proper errors

### Documentation
- [ ] Document environment variables
- [ ] Create admin setup guide
- [ ] Document backup/restore procedures
- [ ] Create incident response plan

## 🔐 Post-Launch Security

### Regular Maintenance
- [ ] Weekly: Review error logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security audit
- [ ] Yearly: Penetration testing (if budget allows)

### User Security
- [ ] Implement password reset flow ✅ (already have forgot-password page)
- [ ] Add 2FA option (future enhancement)
- [ ] Email notifications for security events
- [ ] Session management (view/revoke active sessions)

## 🛠️ Quick Fixes to Implement Now

See implementation files created alongside this checklist.
