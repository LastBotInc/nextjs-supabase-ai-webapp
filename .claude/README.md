# Claude Code Workflow System

This directory contains an organized workflow system for Claude Code to enhance productivity and maintain consistency across the codebase.

## Quick Start

### Using Slash Commands

Execute these commands to trigger specific workflows:
- `/debug` - Debug an issue systematically
- `/test` - Write comprehensive tests
- `/review` - Perform code review
- `/feature` - Implement a new feature
- `/refactor` - Refactor existing code

Example: `/debug Error: Cannot read property 'user' of undefined`

### Directory Structure

- **docs/** - Architecture and feature documentation
- **workflows/** - Step-by-step guides for common tasks
- **agents/** - Specialized agent configurations
- **patterns/** - Reusable code patterns and templates

## Workflows

### 1. Debugging (`workflows/debugging.md`)
Systematic approach to finding and fixing bugs:
- Error analysis and reproduction
- Root cause identification
- Solution implementation
- Knowledge documentation

### 2. Feature Development (`workflows/feature-dev.md`)
Complete feature implementation process:
- Planning and research
- Database design
- API implementation
- Frontend development
- Testing and documentation

### 3. Testing (`workflows/testing.md`)
Comprehensive testing strategy:
- Unit tests for logic
- Component tests for UI
- Integration tests for APIs
- E2E tests for user flows

### 4. Deployment (`workflows/deployment.md`)
Safe deployment process:
- Pre-deployment checks
- Database migrations
- Staged rollout
- Post-deployment verification

### 5. Refactoring (`workflows/refactoring.md`)
Code improvement without changing functionality:
- Code analysis
- Test coverage verification
- Incremental changes
- Performance optimization

## Specialized Agents

Use the Task tool to invoke specialized agents:

### Code Reviewer
```
Task(subagent_type="general-purpose", prompt="Review this PR following .claude/agents/code-reviewer.md")
```

### Test Writer
```
Task(subagent_type="unit-test-implementer", prompt="Write tests for the UserService class")
```

### Debugger
```
Task(subagent_type="general-purpose", prompt="Debug the authentication error following .claude/agents/debugger.md")
```

### API Designer
```
Task(subagent_type="general-purpose", prompt="Design REST API for the blog feature following .claude/agents/api-designer.md")
```

## Patterns

Reusable patterns organized by category:

### Components (`patterns/components/`)
- Frontend page implementation
- Translation management
- Component structure

### API (`patterns/api/`)
- Next.js API routes
- Authentication implementation
- Admin protection

### Database (`patterns/database/`)
- Data model creation
- Migration patterns
- Query optimization

### Testing (`patterns/testing/`)
- Unit test patterns
- Component testing
- E2E test structure

## Best Practices

1. **Always start with the appropriate workflow** - Don't jump straight into code
2. **Use patterns for consistency** - Reference existing patterns when implementing
3. **Document as you go** - Update docs while the context is fresh
4. **Test incrementally** - Write tests alongside implementation
5. **Review before completing** - Use the review agent on your own code

## Integration with CLAUDE.md

The main `CLAUDE.md` file references this workflow system. Claude Code will automatically use these workflows and patterns when appropriate.