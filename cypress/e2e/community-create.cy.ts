beforeEach(() => {
  cy.visit('/communities/create');
  cy.loginViaForm(Cypress.env('DSPACE_TEST_ADMIN_USER'), Cypress.env('DSPACE_TEST_ADMIN_PASSWORD'));
});

it('should show loading component while saving', () => {
  cy.intercept('**/sites/**canSubmit**').as('canSubmit');
  cy.wait('@canSubmit');

  const title = 'Test Community Title';
  cy.get('#title').type(title);

  cy.get('button[type="submit"]').click();

  cy.get('ds-loading').should('be.visible');
});
