/// <reference types="cypress" />

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/en')
  })

  it('should display the homepage', () => {
    cy.url().should('include', '/en')
    cy.get('h1').should('be.visible')
  })

  it('should have proper meta tags', () => {
    cy.get('head title').should('exist')
    cy.get('head meta[name="description"]').should('exist')
  })
})
