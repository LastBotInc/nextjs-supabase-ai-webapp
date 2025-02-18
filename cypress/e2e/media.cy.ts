describe('Media Management', () => {
  beforeEach(() => {
    // Sign in before each test
    cy.visit('/en/auth/signin')
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password')
    cy.get('button[type="submit"]').click()
    cy.visit('/en/admin/media')
  })

  it('should display the media dashboard', () => {
    cy.get('h1').should('contain', 'Media')
    cy.get('[data-testid="upload-zone"]').should('exist')
  })

  it('should handle file upload', () => {
    // Create a test file
    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      // Convert the base64 back to a blob
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg')
      const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testFile)

      // Trigger file upload
      cy.get('input[type="file"]').then(input => {
        input[0].files = dataTransfer.files
        cy.wrap(input).trigger('change', { force: true })
      })

      // Wait for upload to complete
      cy.get('[data-testid="upload-progress"]').should('exist')
      cy.get('[data-testid="upload-status"]').should('contain', '100%')
    })
  })

  it('should show error message on upload failure', () => {
    // Intercept storage upload request and force it to fail
    cy.intercept('POST', '**/storage/v1/object/media/*', {
      statusCode: 400,
      body: {
        error: 'new row violates row-level security policy'
      }
    })

    // Attempt file upload
    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg')
      const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testFile)

      cy.get('input[type="file"]').then(input => {
        input[0].files = dataTransfer.files
        cy.wrap(input).trigger('change', { force: true })
      })

      // Verify error message
      cy.get('[data-testid="upload-error"]')
        .should('contain', 'Upload failed: new row violates row-level security policy')
    })
  })

  it('should show uploaded files in the media grid', () => {
    // Upload a file first
    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg')
      const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testFile)

      cy.get('input[type="file"]').then(input => {
        input[0].files = dataTransfer.files
        cy.wrap(input).trigger('change', { force: true })
      })

      // Wait for upload to complete
      cy.get('[data-testid="upload-status"]').should('contain', '100%')

      // Verify file appears in grid
      cy.get('[data-testid="media-grid"]')
        .should('contain', 'test-image.jpg')
    })
  })

  it('should allow deleting uploaded files', () => {
    // Upload a file first
    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg')
      const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testFile)

      cy.get('input[type="file"]').then(input => {
        input[0].files = dataTransfer.files
        cy.wrap(input).trigger('change', { force: true })
      })

      // Wait for upload to complete
      cy.get('[data-testid="upload-status"]').should('contain', '100%')

      // Click on the file to open details
      cy.get('[data-testid="media-grid"]')
        .contains('test-image.jpg')
        .click()

      // Click delete button
      cy.get('[data-testid="delete-button"]').click()

      // Confirm deletion
      cy.get('[data-testid="confirm-delete"]').click()

      // Verify file is removed
      cy.get('[data-testid="media-grid"]')
        .should('not.contain', 'test-image.jpg')
    })
  })
}) 