import { Result } from 'axe-core';
import { Options } from 'cypress-axe';

/**
 * Selector that matches search result items regardless of the active view mode (list, grid, or detail).
 * Use this instead of hardcoding a single data-test attribute so that tests remain
 * independent of the `preferredDisplayView` configuration.
 */
export const SEARCH_RESULT_VIEW_MODE_SELECTOR = '[data-test="list-object"], [data-test="grid-object"], [data-test="detail-object"]';

/**
 * Switches the search results to list view mode.
 * Use this before interacting with action buttons (edit, delete) that are only available in list view.
 */
export const switchToListView = () => {
  cy.get('ds-search-sidebar [data-test="list-view"]').click();
  cy.get('[data-test="list-object"]').should('exist');
};

// Log violations to terminal/commandline in a table format.
// Uses 'log' and 'table' tasks defined in ../plugins/index.ts
// Borrowed from https://github.com/component-driven/cypress-axe#in-your-spec-file
function terminalLog(violations: Result[]) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${violations.length === 1 ? 'was' : 'were'} detected`,
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, helpUrl, nodes }) => ({
      id,
      impact,
      description,
      helpUrl,
      nodes: nodes.length,
      html: nodes.map(node => node.html),
    }),
  );

  // Print violations as an array, since 'node.html' above often breaks table alignment
  cy.task('log', violationData);
  // Optionally, uncomment to print as a table
  // cy.task('table', violationData);

}

// Custom "testA11y()" method which checks accessibility using cypress-axe
// while also ensuring any violations are logged to the terminal (see terminalLog above)
// This method MUST be called after cy.visit(), as cy.injectAxe() must be called after page load
export const testA11y = (context?: any, options?: Options) => {
  cy.injectAxe();
  cy.configureAxe({
    rules: [
      // Disable color contrast checks as they are inaccurate / result in a lot of false positives
      // See also open issues in axe-core: https://github.com/dequelabs/axe-core/labels/color%20contrast
      { id: 'color-contrast', enabled: false },
    ],
  });
  cy.checkA11y(context, options, terminalLog);
};
