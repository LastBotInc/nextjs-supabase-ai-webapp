describe('Component Interactions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  // Basic test to ensure page loads
  it('should load the page', () => {
    cy.get('body').should('be.visible')
  })
})
