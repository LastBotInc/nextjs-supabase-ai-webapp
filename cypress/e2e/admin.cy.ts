describe('Admin', () => {
  beforeEach(() => {
    // Reset the database to a known state
    // cy.task('db:reset')

    // Visit the sign in page
    cy.visit('/en/auth/sign-in')
  })

  it('should redirect to sign in when accessing admin without auth', () => {
    cy.visit('/en/admin')
    cy.url().should('include', '/auth/sign-in')
  })

  it('should show admin link after signing in', () => {
    // Sign in as admin
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password')
    cy.get('button[type="submit"]').click()

    // Check that admin link appears in navigation
    cy.get('nav').should('contain', 'Admin')
  })

  describe('When authenticated', () => {
    beforeEach(() => {
      // Sign in before each test
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('input[name="password"]').type('password')
      cy.get('button[type="submit"]').click()
      cy.visit('/en/admin/blog')
    })

    it('should display the admin dashboard', () => {
      cy.get('h1').should('contain', 'Blog Admin')
    })

    it('should list blog posts', () => {
      cy.get('ul').should('exist')
      cy.get('li').should('exist')
    })

    it('should allow creating new posts', () => {
      cy.contains('New Post').click()
      cy.get('input[name="title"]').type('Test Post')
      cy.get('input[name="slug"]').type('test-post')
      cy.get('textarea[name="content"]').type('Test content')
      cy.get('button[type="submit"]').click()
      cy.get('ul').should('contain', 'Test Post')
    })

    it('should allow editing posts', () => {
      cy.contains('Edit').first().click()
      cy.get('input[name="title"]').clear().type('Updated Title')
      cy.get('button[type="submit"]').click()
      cy.get('ul').should('contain', 'Updated Title')
    })

    it('should allow deleting posts', () => {
      const postTitle = 'Test Post to Delete'

      // First create a post
      cy.contains('New Post').click()
      cy.get('input[name="title"]').type(postTitle)
      cy.get('input[name="slug"]').type('test-post-delete')
      cy.get('textarea[name="content"]').type('Test content')
      cy.get('button[type="submit"]').click()

      // Then delete it
      cy.contains(postTitle).parent().contains('Delete').click()
      cy.get('ul').should('not.contain', postTitle)
    })

    it('should handle different locales', () => {
      // Switch to Finnish
      cy.get('select').select('fi')
      cy.url().should('include', '/fi/hallinta')
      cy.get('h1').should('exist')

      // Switch back to English
      cy.get('select').select('en')
      cy.url().should('include', '/en/admin')
      cy.get('h1').should('exist')
    })
  })
})
