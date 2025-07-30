# Deployment & DevOps Tools

## Overview
Tools for deployment, version control, and project management using Vercel and GitHub.

## Vercel CLI

### Deployment Commands
```bash
# Deploy to preview environment
npm run vercel

# Deploy to production
npm run vercel -- --prod

# Deploy with specific options
npm run vercel -- deploy --environment production --project my-app
```

### Project Management
```bash
# List recent deployments
npm run vercel -- list
npm run vercel -- list --count 10

# View logs
npm run vercel -- logs
npm run vercel -- logs --follow
npm run vercel -- logs --deployment dpl_xxxxx

# Promote deployment to production
npm run vercel -- promote https://my-app-xxxxx.vercel.app
```

### Environment Variables
```bash
# List all env vars
npm run vercel -- env list

# Add environment variable
npm run vercel -- env add KEY=value
npm run vercel -- env add SECRET_KEY=value --environment production

# Remove environment variable
npm run vercel -- env remove KEY
npm run vercel -- env remove KEY --environment production
```

### Domain Management
```bash
# List domains
npm run vercel -- domains list

# Add domain
npm run vercel -- domains add example.com

# Remove domain
npm run vercel -- domains remove example.com
```

## GitHub CLI

### Authentication
```bash
# Login to GitHub
npm run github -- auth -l
npm run github -- auth --login

# Check auth status
npm run github -- auth -s
npm run github -- auth --status

# Refresh credentials
npm run github -- auth -r
npm run github -- auth --refresh

# Logout
npm run github -- auth -o
npm run github -- auth --logout
```

### Pull Requests
```bash
# Create pull request
npm run github -- pr-create
npm run github -- pr-create --title "Feature: Add user dashboard" --body "Description"

# Create draft PR
npm run github -- pr-create --draft --title "WIP: New feature"

# List pull requests
npm run github -- pr-list
npm run github -- pr-list --state all --limit 50
npm run github -- pr-list --author username

# View PR details
npm run github -- pr-view 123
npm run github -- pr-view 123 --web  # Open in browser
```

### Issues
```bash
# Create issue
npm run github -- issue-create
npm run github -- issue-create --title "Bug: Login error" --body "Details..."

# With labels and assignee
npm run github -- issue-create \
  --title "Feature request" \
  --label enhancement \
  --assignee username

# List issues
npm run github -- issue-list
npm run github -- issue-list --state all --label bug
npm run github -- issue-list --assignee @me
```

### Releases
```bash
# Create release
npm run github -- release-create v1.0.0
npm run github -- release-create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "Release notes..."

# Auto-generate notes
npm run github -- release-create v1.0.0 --generate-notes

# Create draft release
npm run github -- release-create v1.0.0 --draft

# List releases
npm run github -- release-list
npm run github -- release-list --limit 5
```

### Repository Management
```bash
# Create repository
npm run github -- repo --create \
  --description "My new project" \
  --private

# View repository
npm run github -- repo --view
npm run github -- repo --view --web

# List repositories
npm run github -- repo --list
```

### Workflows
```bash
# List GitHub Actions workflows
npm run github -- workflow --list

# Run workflow
npm run github -- workflow --run workflow-name

# Enable/disable workflow
npm run github -- workflow --enable workflow-name
npm run github -- workflow --disable workflow-name
```

### Task Management
```bash
# List tasks from projects
npm run github -- tasks
npm run github -- tasks --project 123
npm run github -- tasks --status open --assignee @me

# Filter tasks
npm run github -- tasks --label "priority:high"
npm run github -- tasks --format json > tasks.json
```

## Deployment Workflows

### Feature Branch Deployment
```bash
# 1. Create feature branch
git checkout -b feature/new-dashboard

# 2. Deploy preview
npm run vercel

# 3. Create PR with preview URL
npm run github -- pr-create \
  --title "Feature: New Dashboard" \
  --body "Preview: https://app-feature-xxxxx.vercel.app"
```

### Production Deployment
```bash
# 1. Ensure on main branch
git checkout main
git pull origin main

# 2. Run tests
npm test
npm run build

# 3. Deploy to production
npm run vercel -- --prod

# 4. Create release
npm run github -- release-create v1.2.0 --generate-notes
```

### Rollback Procedure
```bash
# 1. Find previous deployment
npm run vercel -- list

# 2. Promote previous version
npm run vercel -- promote https://app-previous-xxxxx.vercel.app

# 3. Document in issue
npm run github -- issue-create \
  --title "Rollback: v1.2.0 to v1.1.9" \
  --label "incident"
```

## Environment Management

### Development Setup
```bash
# Pull environment variables
vercel env pull .env.local

# Set up local environment
npm run vercel -- env add DATABASE_URL=xxx --environment development
```

### Production Secrets
```bash
# Add production secret
npm run vercel -- env add API_KEY=xxx --environment production

# Verify environment
npm run vercel -- env list --environment production
```

## Best Practices

### 1. Deployment Strategy
- Always deploy to preview first
- Test preview thoroughly
- Get approval before production
- Tag releases appropriately

### 2. Environment Variables
- Never commit secrets
- Use different values per environment
- Document all variables
- Rotate secrets regularly

### 3. Pull Request Workflow
- Use descriptive titles
- Include preview links
- Reference issues
- Request reviews

### 4. Release Management
- Follow semantic versioning
- Generate release notes
- Include breaking changes
- Test rollback procedure

## Troubleshooting

### Vercel Issues
```bash
# Check deployment status
npm run vercel -- inspect deployment-url

# View build logs
npm run vercel -- logs --deployment dpl_xxxxx

# Re-authenticate
vercel logout
vercel login
```

### GitHub CLI Issues
```bash
# Re-authenticate
npm run github -- auth --logout
npm run github -- auth --login

# Check repository context
git remote -v

# Set default repository
gh repo set-default owner/repo
```

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### Automated PR Checks
- Set up branch protection
- Require PR reviews
- Run tests on PR
- Check preview deployments