# Debugging Workflow

## Overview
Systematic approach to diagnosing and resolving errors in the codebase.

## Prerequisites
- [ ] Error message or bug description
- [ ] Access to relevant logs
- [ ] Test environment ready

## Workflow Steps

### Step 1: Gather Context 🔍
- [ ] Read error message carefully, noting:
  - Error type and code
  - Stack trace location
  - Timestamp and frequency
- [ ] Check `docs/learnings.md` for similar previous issues
- [ ] Search codebase for error patterns using Grep
- [ ] Review recent commits if error is new
- [ ] Check browser console and network tab (for frontend issues)

### Step 2: Reproduce Issue 🔄
- [ ] Identify steps to reproduce
- [ ] Create minimal reproduction case
- [ ] Verify issue occurs consistently
- [ ] Note any environmental factors

### Step 3: Diagnose Root Cause 🎯
- [ ] Analyze stack trace to find error origin
- [ ] Check for:
  - Type mismatches
  - Null/undefined references
  - Async/await issues
  - State management problems
  - API response errors
- [ ] Add temporary logging if needed
- [ ] Use debugger or breakpoints

### Step 4: Implement Fix 🛠️
- [ ] Create targeted fix addressing root cause
- [ ] Ensure fix doesn't break existing functionality
- [ ] Follow project coding standards
- [ ] Add error handling if appropriate

### Step 5: Validate Fix ✅
- [ ] Run affected unit tests
- [ ] Run E2E tests for the feature
- [ ] Test edge cases
- [ ] Verify fix in different environments
- [ ] Check for performance impact

### Step 6: Document Solution 📝
- [ ] Update `docs/learnings.md` with:
  - Problem description
  - Root cause analysis
  - Solution implemented
  - Prevention strategies
- [ ] Add code comments if complex
- [ ] Update tests to prevent regression

## Common Issues & Quick Fixes

### TypeScript Errors
```bash
npm run typecheck
```
- Check for missing types
- Verify import paths
- Update type definitions

### Build Errors
```bash
npm run build
```
- Clear `.next` cache
- Check for circular dependencies
- Verify environment variables

### Test Failures
```bash
npm test
npm run cypress
```
- Update snapshots if needed
- Check for timing issues
- Verify test data

### Database Errors
- Check Supabase connection
- Verify RLS policies
- Check for migration issues

## Tools to Use
- **Grep**: Search for error patterns
- **Read**: Examine relevant files
- **Bash**: Run tests and checks
- **Edit/MultiEdit**: Apply fixes
- **WebSearch**: Look up unfamiliar errors