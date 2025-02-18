describe('Blog Images', () => {
  beforeEach(() => {
    // Visit the blog listing page
    cy.visit('/en/blog');
  });

  it('should display featured images for blog posts', () => {
    // Check if blog post cards have images
    cy.get('[data-testid="blog-post-card"]').each(($card) => {
      cy.wrap($card)
        .find('[data-testid="featured-image"]')
        .should('be.visible')
        .and(($img) => {
          // Check if image is loaded
          const img = $img[0] as HTMLImageElement;
          expect(img.naturalWidth).to.be.greaterThan(0);
        });
    });
  });

  it('should display optimized images with correct dimensions', () => {
    cy.get('[data-testid="blog-post-card"]').first().find('[data-testid="featured-image"]')
      .should('have.attr', 'width', '1024')
      .should('have.attr', 'height', '768');
  });

  it('should display featured image on blog post detail page', () => {
    // Click on the first blog post
    cy.get('[data-testid="blog-post-card"]').first().click();

    // Check if the featured image is displayed
    cy.get('[data-testid="post-featured-image"]')
      .should('be.visible')
      .and(($img) => {
        const img = $img[0] as HTMLImageElement;
        expect(img.naturalWidth).to.be.greaterThan(0);
      });
  });

  it('should load images in WebP format when supported', () => {
    cy.get('[data-testid="blog-post-card"]').first().find('[data-testid="featured-image"]')
      .should('have.attr', 'src')
      .and('match', /\.webp$/);
  });
});
