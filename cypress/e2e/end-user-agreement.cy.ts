import { testA11y } from 'cypress/support/utils';

describe('End User Agreement', () => {
  it('should pass accessibility tests', () => {
    cy.visit('/info/end-user-agreement');

    // Page must first be visible
    cy.get('ds-end-user-agreement').should('be.visible');

    // Analyze <ds-end-user-agreement> for accessibility
    testA11y({
      include: ['ds-end-user-agreement'],
      exclude: ['ds-markdown-viewer'],
    });
  });
});
