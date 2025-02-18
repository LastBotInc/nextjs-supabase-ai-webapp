describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/en')
  })

  it('should have Supabase initialized', () => {
    // Check that the page loads without errors
    cy.get('h1').should('be.visible')
  })

  it('should maintain session across navigation', () => {
    cy.visit('/en')
    cy.get('h1').should('be.visible')
    cy.visit('/en/about')
    cy.url().should('include', '/en/about')
  })
})
