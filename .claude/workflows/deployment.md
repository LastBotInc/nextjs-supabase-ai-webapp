# Deployment Workflow

## Overview
Step-by-step process for deploying changes from development to production.

## Pre-Deployment Checklist

### Code Quality ✅
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting warnings
- [ ] Code reviewed and approved
- [ ] No console.logs in production code
- [ ] No hardcoded secrets

### Database 🗄️
- [ ] Migrations tested locally
- [ ] RLS policies verified
- [ ] Backup production database
- [ ] Migration rollback plan ready

### Environment 🔧
- [ ] Environment variables documented
- [ ] Production secrets configured
- [ ] API keys have proper limits
- [ ] Rate limiting configured

## Deployment Steps

### Step 1: Final Local Checks 🏠

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run all checks
npm run typecheck
npm run lint
npm test
npm run build

# Test production build locally
npm run start
```

### Step 2: Prepare Release 📦

#### Create Release Branch
```bash
git checkout -b release/v1.x.x
git push origin release/v1.x.x
```

#### Update Version
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create release notes

### Step 3: Database Migration 🔄

#### For Supabase
```bash
# Review pending migrations
supabase db diff

# Push to staging first
supabase db push --db-url $STAGING_DB_URL

# Test on staging
# Then push to production
supabase db push --db-url $PRODUCTION_DB_URL
```

### Step 4: Deploy to Staging 🎭

#### Vercel Deployment
```bash
# Deploy to preview
npm run vercel

# Or push to staging branch
git push origin release/v1.x.x:staging
```

#### Staging Tests
- [ ] Smoke tests on core features
- [ ] Check all integrations
- [ ] Verify translations
- [ ] Test payment flows
- [ ] Check analytics

### Step 5: Deploy to Production 🚀

#### Via Vercel
```bash
# Deploy to production
npm run vercel -- --prod

# Or merge to main
git checkout main
git merge release/v1.x.x
git push origin main
```

#### Via GitHub
1. Create Pull Request to main
2. Wait for CI checks
3. Merge when approved
4. Automatic deployment triggers

### Step 6: Post-Deployment Verification 🔍

#### Immediate Checks
- [ ] Site accessible
- [ ] No console errors
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Database queries working

#### Monitoring
- [ ] Check error tracking (Sentry)
- [ ] Monitor performance metrics
- [ ] Watch server logs
- [ ] Check analytics

#### User Verification
- [ ] Test critical user paths
- [ ] Verify email sending
- [ ] Check payment processing
- [ ] Test on multiple devices

### Step 7: Rollback Plan 🔙

#### If Issues Detected
1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   ```bash
   supabase db reset --db-url $PRODUCTION_DB_URL
   # Apply previous migration version
   ```

3. **Notify Team**
   - Post in #deploys channel
   - Create incident ticket
   - Document issues

## Environment-Specific Configurations

### Development
- Debug logging enabled
- Relaxed rate limits
- Test payment providers
- Local Supabase instance

### Staging
- Production-like environment
- Real integrations with test keys
- Reduced rate limits
- Staging database

### Production
- Error tracking enabled
- Strict rate limits
- Production API keys
- Performance monitoring

## CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    # Run tests
  deploy:
    needs: test
    # Deploy to Vercel
```

### Automated Checks
- [ ] Lint and format
- [ ] Type checking
- [ ] Unit tests
- [ ] Build verification
- [ ] Bundle size check

## Security Checklist

### Before Deploy
- [ ] Security headers configured
- [ ] CSP policy updated
- [ ] API rate limiting active
- [ ] Input validation thorough
- [ ] No exposed secrets

### After Deploy
- [ ] SSL certificate valid
- [ ] Security scan passed
- [ ] Penetration test (quarterly)
- [ ] Dependency audit clean

## Communication

### Pre-Deployment
- [ ] Notify team of deployment window
- [ ] Update status page if needed
- [ ] Prepare user communications

### Post-Deployment
- [ ] Announce successful deployment
- [ ] Update documentation
- [ ] Share release notes
- [ ] Monitor user feedback

## Deployment Schedule

### Regular Releases
- **Tuesday/Thursday**: Feature releases
- **Emergency**: Hot fixes anytime
- **Major**: Scheduled maintenance window

### Best Practices
- Deploy during low traffic
- Avoid Friday deployments
- Have team available post-deploy
- Use feature flags for gradual rollout