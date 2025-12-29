import { testA11y } from 'cypress/support/utils';

describe('Header', () => {
  it('should pass accessibility tests', () => {
    cy.visit('/');

    // Header must first be visible
    cy.get('ds-header').should('be.visible');

    // Analyze <ds-header> for accessibility
    testA11y('ds-header');
  });

  it('should allow for changing language to German (for example)', () => {
    cy.visit('/');

    // This test should only run if the language switcher is visible.
    // We query for the body first, so the test doesn't fail if the button doesn't exist.
    cy.get('body').then($body => {
      if ($body.find('button[data-test="lang-switch"]').is(':visible')) {

        // Click the language switcher (globe) in header
        cy.get('button[data-test="lang-switch"]').click();
        // Click on the "Deutsch" language in dropdown
        cy.get('#language-menu-list div[role="option"]').contains('Deutsch').click();

        // HTML "lang" attribute should switch to "de"
        cy.get('html').invoke('attr', 'lang').should('eq', 'de');

        // Login menu should now be in German
        cy.get('[data-test="login-menu"]').contains('Anmelden');

        // Change back to English from language switcher
        cy.get('button[data-test="lang-switch"]').click();
        cy.get('#language-menu-list div[role="option"]').contains('English').click();

        // HTML "lang" attribute should switch to "en"
        cy.get('html').invoke('attr', 'lang').should('eq', 'en');

        // Login menu should now be in English
        cy.get('[data-test="login-menu"]').contains('Log In');
      }
    });
  });

});
