describe('Gemini API', () => {
  beforeEach(() => {
    // Clear cookies and localStorage before each test
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('/en', { failOnStatusCode: false })
  })

  it('should return 401 when not authenticated', () => {
    cy.request({
      method: 'POST',
      url: '/api/gemini',
      failOnStatusCode: false,
      body: {
        prompt: 'test'
      }
    }).then((response) => {
      expect(response.status).to.equal(401)
      expect(response.body.error).to.equal('Missing or invalid authorization header')
    })
  })

  it('should handle missing prompt before auth check', () => {
    cy.request({
      method: 'POST',
      url: '/api/gemini',
      failOnStatusCode: false,
      headers: {
        Authorization: 'Bearer invalid-token'
      },
      body: {}
    }).then((response) => {
      expect(response.status).to.equal(400)
      expect(response.body.error).to.equal('Prompt is required')
    })
  })

  it('should work when authenticated', () => {
    // Mock the auth token
    const token = 'test-token'

    cy.request({
      method: 'POST',
      url: '/api/gemini',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        prompt: 'test'
      }
    }).then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.have.property('content')
    })
  })
}) 