describe('Blog AI Features', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/en/auth/signin')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password')
    cy.get('button[type="submit"]').click()
    cy.visit('/en/admin/blog')
  })

  it('should generate blog content with AI', () => {
    // Start new post
    cy.contains('New Post').click()

    // Enter title
    cy.get('input[id="title"]').type('Test AI Generated Post')

    // Generate content with AI
    cy.contains('Generate with AI').click()

    // Wait for content generation
    cy.contains('Generating...').should('exist')
    cy.contains('Generating...').should('not.exist')

    // Verify generated content
    cy.get('textarea[id="excerpt"]').should('not.have.value', '')
    cy.get('textarea[id="meta_description"]').should('not.have.value', '')
    cy.get('[data-testid="rich-text-editor"]').should('not.have.text', '')
  })

  it('should generate featured image with AI', () => {
    // Start new post
    cy.contains('New Post').click()

    // Enter title
    cy.get('input[id="title"]').type('Test AI Generated Image')

    // Generate image with AI
    cy.contains('Generate Image').click()

    // Wait for image generation
    cy.contains('Generating...').should('exist')
    cy.contains('Generating...').should('not.exist')

    // Verify generated image
    cy.get('input[id="featured_image"]').should('not.have.value', '')
    cy.get('img[alt="Featured"]').should('be.visible')
  })

  it('should handle AI generation errors gracefully', () => {
    // Intercept AI API calls and force them to fail
    cy.intercept('/api/gemini', {
      statusCode: 500,
      body: { error: 'Failed to generate content' }
    })
    cy.intercept('/api/recraft', {
      statusCode: 500,
      body: { error: 'Failed to generate image' }
    })

    // Start new post
    cy.contains('New Post').click()

    // Enter title
    cy.get('input[id="title"]').type('Test Error Handling')

    // Try to generate content
    cy.contains('Generate with AI').click()
    cy.contains('Failed to generate content').should('be.visible')

    // Try to generate image
    cy.contains('Generate Image').click()
    cy.contains('Failed to generate image').should('be.visible')
  })

  it('should require title for AI generation', () => {
    // Start new post
    cy.contains('New Post').click()

    // Verify AI buttons are disabled without title
    cy.contains('Generate with AI').should('be.disabled')
    cy.contains('Generate Image').should('be.disabled')

    // Enter title
    cy.get('input[id="title"]').type('Test Title Required')

    // Verify AI buttons are enabled with title
    cy.contains('Generate with AI').should('not.be.disabled')
    cy.contains('Generate Image').should('not.be.disabled')
  })

  it('should save AI generated content', () => {
    // Start new post
    cy.contains('New Post').click()

    // Enter title and generate content
    cy.get('input[id="title"]').type('Test Save Generated Content')
    cy.get('input[id="slug"]').type('test-save-generated-content')
    cy.contains('Generate with AI').click()

    // Wait for content generation
    cy.contains('Generating...').should('not.exist')

    // Generate image
    cy.contains('Generate Image').click()
    cy.contains('Generating...').should('not.exist')

    // Save post
    cy.contains('Save').click()

    // Verify post is saved and appears in list
    cy.contains('Test Save Generated Content').should('be.visible')
  })
}) 