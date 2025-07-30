# Testing Workflow

## Overview
Comprehensive testing strategy covering unit tests, integration tests, and E2E tests.

## Testing Philosophy
- Write tests that provide confidence
- Focus on user behavior over implementation
- Maintain good test coverage
- Keep tests maintainable

## Workflow Steps

### Step 1: Unit Testing 🧩

#### Setup
- [ ] Identify functions/utilities to test
- [ ] Create test file: `__tests__/[name].test.ts`
- [ ] Import testing utilities

#### Writing Tests
```typescript
import { describe, it, expect } from 'vitest'

describe('FeatureName', () => {
  it('should handle expected behavior', () => {
    // Arrange
    const input = ...
    
    // Act
    const result = functionUnderTest(input)
    
    // Assert
    expect(result).toBe(expected)
  })
})
```

#### Run Tests
```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Coverage report
```

### Step 2: Component Testing 🎨

#### Test Categories
- [ ] Rendering tests
- [ ] User interaction tests
- [ ] State management tests
- [ ] Error handling tests

#### Example Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react'

describe('Component', () => {
  it('handles user interaction', async () => {
    render(<Component />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(await screen.findByText('Result')).toBeInTheDocument()
  })
})
```

### Step 3: API Testing 🔌

#### Test API Routes
- [ ] Test successful responses
- [ ] Test error handling
- [ ] Test authentication
- [ ] Test validation

#### Example API Test
```typescript
describe('API: /api/endpoint', () => {
  it('returns data for authenticated user', async () => {
    const response = await fetch('/api/endpoint', {
      headers: { Authorization: 'Bearer token' }
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({ ... })
  })
})
```

### Step 4: E2E Testing 🚀

#### Setup Cypress Tests
```bash
# Run in interactive mode
npm run cypress:open

# Run headlessly
npm run cypress:run
```

#### Write E2E Tests
```typescript
describe('Feature Flow', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login() // Custom command
  })
  
  it('completes user journey', () => {
    cy.get('[data-testid="start-button"]').click()
    cy.fillForm({ name: 'Test User' })
    cy.get('[data-testid="submit"]').click()
    
    cy.contains('Success!').should('be.visible')
    cy.url().should('include', '/success')
  })
})
```

### Step 5: Testing Best Practices 📏

#### Test Structure
- **Arrange**: Set up test data and environment
- **Act**: Execute the code being tested
- **Assert**: Verify the outcome

#### What to Test
- [ ] Happy path scenarios
- [ ] Edge cases
- [ ] Error conditions
- [ ] Loading states
- [ ] Empty states
- [ ] Authentication states

#### What NOT to Test
- Implementation details
- Third-party libraries
- Framework functionality
- Trivial getters/setters

### Step 6: Continuous Testing 🔄

#### Pre-commit
- Run affected tests
- Check test coverage
- Ensure no `.only` or `.skip`

#### CI/CD Pipeline
- Run full test suite
- Generate coverage reports
- Block merge on failures
- Performance benchmarks

## Testing Checklist

### Before Writing Code
- [ ] Plan test scenarios
- [ ] Set up test data
- [ ] Consider edge cases

### While Writing Code
- [ ] Write testable code
- [ ] Add data-testid attributes
- [ ] Keep functions pure when possible

### After Writing Code
- [ ] Achieve >80% coverage
- [ ] Test in multiple browsers
- [ ] Test responsive design
- [ ] Test accessibility

## Common Testing Patterns

### Mocking
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [] })
    }))
  }
}))
```

### Custom Matchers
```typescript
expect.extend({
  toBeWithinRange(received, min, max) {
    const pass = received >= min && received <= max
    return { pass, message: () => `expected ${received} to be within range ${min}-${max}` }
  }
})
```

### Test Utilities
Create reusable test helpers in `test-utils/`:
- Mock data factories
- Custom render functions
- Common assertions
- Test fixtures

## Debugging Tests

### Tools
- `console.log()` for quick debugging
- `screen.debug()` for component state
- Browser DevTools in Cypress
- VS Code debugger integration

### Common Issues
- **Async issues**: Use `waitFor` or `findBy`
- **State updates**: Wrap in `act()`
- **Flaky tests**: Add proper waits
- **Environment**: Check test setup