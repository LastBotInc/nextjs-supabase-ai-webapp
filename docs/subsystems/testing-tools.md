# Testing & Development Tools Subsystem

## Overview

The Testing & Development Tools subsystem provides comprehensive testing infrastructure and development utilities for maintaining code quality and developer productivity. It includes unit testing with Vitest, end-to-end testing with Cypress, extensive CLI tools for various development tasks, and database seeding scripts. The subsystem ensures code reliability through automated testing while providing powerful tools for local development and debugging.

This subsystem is essential for maintaining high code quality standards and enabling efficient development workflows. It supports test-driven development, continuous integration, and provides utilities for common development tasks like data seeding, API testing, and performance optimization.

## Key Components

### Testing Framework
- **Vitest**: Unit and integration testing
- **Cypress**: End-to-end testing
- **Testing Library**: React component testing
- **Jest DOM**: DOM assertion utilities

### Development Tools (`tools/`)
- **CLI Tools**: 20+ command-line utilities
- **AI Integration Tools**: Gemini, OpenAI, Replicate
- **Media Tools**: Image and video processing
- **Deployment Tools**: Vercel and GitHub integration

### Database Tools (`scripts/`)
- **Seeding Scripts**: Test data generation
- **Migration Tools**: Schema management
- **Reset Scripts**: Environment cleanup
- **Import/Export**: Data management

### Development Environment
- **Hot Reloading**: Fast development cycle
- **Type Checking**: TypeScript integration
- **Linting**: Code quality enforcement
- **Debugging**: Source map support

## Dependencies

### External Dependencies
- `vitest`: Modern test runner
- `cypress`: E2E testing framework
- `@testing-library/react`: React testing
- `tsx`: TypeScript execution
- Development tool CLIs

### Internal Dependencies
- All subsystems are tested
- Mock implementations
- Test utilities and helpers
- Fixture data

## Entry Points

### Testing Commands
1. **Unit Tests**: `npm test`
2. **Watch Mode**: `npm run test:watch`
3. **Coverage**: `npm run test:coverage`
4. **E2E Tests**: `npm run cypress`
5. **Headless E2E**: `npm run test:e2e:headless`

### Development Tools
1. **Gemini CLI**: `npm run gemini`
2. **Image Tools**: `npm run optimize-image`
3. **Database Tools**: `npm run seed:*`
4. **Deployment**: `npm run vercel`

## Data Flow

### Test Execution Flow
1. Test runner initialized
2. Test files discovered
3. Setup hooks executed
4. Tests run in isolation
5. Assertions evaluated
6. Coverage collected
7. Results reported

### E2E Testing Flow
1. Development server started
2. Cypress launches browser
3. Test scenarios executed
4. User interactions simulated
5. Assertions verified
6. Screenshots on failure
7. Video recordings saved

### Development Tool Flow
1. CLI command invoked
2. Arguments parsed
3. Tool logic executed
4. External APIs called
5. Results processed
6. Output displayed
7. Files generated/modified

## Key Patterns

### Unit Test Pattern
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Pattern
```typescript
describe('Blog Feature', () => {
  beforeEach(() => {
    cy.visit('/en/blog');
  });
  
  it('should display blog posts', () => {
    cy.get('[data-testid="blog-post"]').should('have.length.greaterThan', 0);
    cy.get('[data-testid="blog-title"]').first().click();
    cy.url().should('include', '/blog/');
  });
});
```

### CLI Tool Pattern
```typescript
#!/usr/bin/env tsx
import { program } from 'commander';

program
  .option('-i, --input <file>', 'Input file')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    // Tool implementation
  });

program.parse();
```

## File Inventory

### Test Configuration
- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test setup file
- `jest.config.js` - Jest configuration
- `jest.setup.ts` - Jest setup
- `cypress.config.ts` - Cypress configuration
- `tsconfig.test.json` - Test TypeScript config

### Unit Test Files
- `__tests__/components/*.test.tsx` - Component tests
- `__tests__/app/[locale]/*/*.test.tsx` - Page tests
- `__tests__/lib/*.test.ts` - Library tests
- `__tests__/utils/*.test.ts` - Utility tests
- `__tests__/admin/*.test.tsx` - Admin tests

### E2E Test Files
- `cypress/e2e/admin.cy.ts` - Admin workflows
- `cypress/e2e/auth.cy.ts` - Authentication
- `cypress/e2e/blog.cy.ts` - Blog features
- `cypress/e2e/blog-ai.cy.ts` - AI blog features
- `cypress/e2e/blog-images.cy.ts` - Image handling
- `cypress/e2e/components.cy.ts` - Components
- `cypress/e2e/gemini.cy.ts` - Gemini integration
- `cypress/e2e/home.cy.ts` - Homepage
- `cypress/e2e/media.cy.ts` - Media library

### CLI Tools
- `tools/gemini.ts` - Gemini text tool
- `tools/gemini-image-tool.js` - Image generation
- `tools/gemini-video-tool.js` - Video generation
- `tools/openai-image-tool.js` - OpenAI images
- `tools/recraft.ts` - Recraft integration
- `tools/flux.ts` - Flux image generation
- `tools/generate-video.ts` - Video synthesis
- `tools/image-optimizer.ts` - Image optimization
- `tools/remove-background-advanced.ts` - BG removal
- `tools/html-to-md.ts` - HTML conversion
- `tools/tavily-search.ts` - Web search
- `tools/download-file.ts` - File downloader
- `tools/vercel-cli.ts` - Vercel deployment
- `tools/github-cli.ts` - GitHub operations
- `tools/send-email-sendgrid.ts` - Email testing
- `tools/submit-sitemap.ts` - SEO tools
- `tools/schema-detector.ts` - Schema detection
- `tools/schema-mapper-tool.ts` - Schema mapping
- `tools/invert-colors.ts` - Image processing

### Database Scripts
- `scripts/seed-users.ts` - User seeding
- `scripts/seed-blog.ts` - Blog content
- `scripts/seed-content-types.ts` - Content types
- `scripts/seed-brand.ts` - Brand data
- `scripts/seed-personas.ts` - AI personas
- `scripts/seed-seo-project.ts` - SEO data
- `scripts/import-translations.ts` - i18n import
- `scripts/check-translations.ts` - i18n validation
- `scripts/update-blog-images.ts` - Image updates
- `scripts/reset-and-seed.sh` - Full reset
- `scripts/reset-local-env.sh` - Local reset

### Supporting Files
- `test/data/` - Test fixtures
- `mocks/` - Mock implementations
- `cypress/support/` - Cypress helpers
- `tools/utils/` - Tool utilities
- `tools/package.json` - Tool dependencies
- `tools/tsconfig.json` - Tool TypeScript

### Coverage Reports
- `coverage/` - Test coverage data
- HTML coverage reports
- Coverage configuration