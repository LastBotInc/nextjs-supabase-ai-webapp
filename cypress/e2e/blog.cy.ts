describe('Blog', () => {
  beforeEach(() => {
    cy.visit('/en/blog')
  })

  it('should display the blog listing page', () => {
    cy.get('h1').should('contain', 'Blog')
  })

  it('should show blog posts', () => {
    cy.get('article').should('exist')
  })

  it('should navigate to a blog post', () => {
    cy.get('article').first().find('a').first().click()
    cy.url().should('include', '/blog/')
    cy.get('article').should('exist')
  })

  it('should show post metadata', () => {
    cy.get('article').first().within(() => {
      cy.get('time').should('exist')
      cy.get('h2').should('exist')
      cy.get('p').should('exist')
    })
  })

  it('should handle different locales', () => {
    // Switch to Finnish
    cy.get('select').select('fi')
    cy.url().should('include', '/fi/blogi')
    cy.get('h1').should('exist')

    // Switch back to English
    cy.get('select').select('en')
    cy.url().should('include', '/en/blog')
    cy.get('h1').should('exist')
  })
})
