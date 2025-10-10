import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    // Global DSpace environment variables used in all our Cypress e2e tests
    // May be modified in this config, or overridden in a variety of ways.
    // See Cypress environment variable docs: https://docs.cypress.io/guides/guides/environment-variables
    // Default values listed here are all valid for the Demo Entities Data set available at
    // https://github.com/DSpace-Labs/AIP-Files/releases/tag/demo-entities-data
    // (This is the data set used in our CI environment)

    // Admin account used for administrative tests
    DSPACE_TEST_ADMIN_USER: 'admin@admin.com',
    DSPACE_TEST_ADMIN_USER_UUID: '335647b6-8a52-4ecb-a8c1-7ebabb199bda',
    DSPACE_TEST_ADMIN_PASSWORD: 'admin',
    // Community/collection/publication used for view/edit tests
    DSPACE_TEST_COMMUNITY: 'a30b75e4-1682-4b4d-85fd-a47fc78dbcf6',
    DSPACE_TEST_COLLECTION: 'caf04bfa-b2f6-40d3-90d2-aa0b86d92f8d',
    DSPACE_TEST_ENTITY_PUBLICATION: '9d1efbce-4d55-446c-ac70-0ba8998d04d2',
    // Search term (should return results) used in search tests
    DSPACE_TEST_SEARCH_TERM: 'test',
    // Main Collection used for submission tests. Should be able to accept normal Item objects
    DSPACE_TEST_SUBMIT_COLLECTION_NAME: 'Equipments',
    DSPACE_TEST_SUBMIT_COLLECTION_UUID: 'c1da6a21-451f-430d-ad28-0f16e5b38fa0',
    // Collection used for Person entity submission tests. MUST be configured with EntityType=Person.
    DSPACE_TEST_SUBMIT_PERSON_COLLECTION_NAME: 'Persons',
    // Account used to test basic submission process
    DSPACE_TEST_SUBMIT_USER: 'admin@admin.com',
    DSPACE_TEST_SUBMIT_USER_PASSWORD: 'admin',
    // Administrator users group
    DSPACE_ADMINISTRATOR_GROUP: 'f8c90336-34c1-4ad6-ab63-ba4b9357f087'
  },
  e2e: {
    // Setup our plugins for e2e tests
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts')(on, config);
    },
    // This is the base URL that Cypress will run all tests against
    // It can be overridden via the CYPRESS_BASE_URL environment variable
    // (By default we set this to a value which should work in most development environments)
    baseUrl: 'http://localhost:4000',
    excludeSpecPattern: [
      'cypress/e2e/collection-create.cy.ts',
      'cypress/e2e/collection-edit.cy.ts',
      'cypress/e2e/collection-statistics.cy.ts',
      'cypress/e2e/community-edit.cy.ts',
      'cypress/e2e/community-statistics.cy.ts',
      'cypress/e2e/homepage.cy.ts',
      'cypress/e2e/item-edit.cy.ts',
      'cypress/e2e/item-template.cy.ts',
      'cypress/e2e/login-modal.cy.ts',
      'cypress/e2e/search-navbar.cy.ts',
      'cypress/e2e/search-page.cy.ts',
    ]
  },
  defaultCommandTimeout: 15000,
  requestTimeout: 30000,
});
