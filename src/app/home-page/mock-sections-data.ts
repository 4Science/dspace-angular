export const SectionData = {
  _embedded: {
    sections: [
      {
        id: 'researchoutputs',
        componentRows: [
          [
            {
              browseNames: [
                'rodept',
                'author',
                'title',
                'type',
                'dateissued',
                'subject',
              ],
              style: 'col-md-4',
              componentType: 'browse',
            },
            {
              discoveryConfigurationName: 'researchoutputs',
              style: 'col-md-8',
              searchType: null,
              initialStatements: 3,
              displayTitle: true,
              componentType: 'search',
            },
          ],
          [
            {
              discoveryConfigurationName: 'researchoutputs',
              sortField: 'dc.date.accessioned',
              order: 'desc',
              style: 'col-md-6',
              titleKey: null,
              numberOfItems: 5,
              componentType: 'top',
            },
            {
              discoveryConfigurationName: 'researchoutputs',
              sortField: 'metric.view',
              order: 'desc',
              style: 'col-md-6',
              titleKey: null,
              numberOfItems: 5,
              componentType: 'top',
            },
          ],
          [
            {
              discoveryConfigurationName: 'researchoutputs',
              style: 'col-md-12',
              facetsPerRow: 4,
              componentType: 'facet',
            },
          ],
        ],
        type: 'section',
        _links: {
          self: {
            href: 'https://dspacecris7.4science.cloud/server/api/layout/sections/researchoutputs',
          },
        },
      },
      {
        id: 'fundings_and_projects',
        componentRows: [
          [
            {
              browseNames: ['pjtitle'],
              style: 'col-md-4',
              componentType: 'browse',
            },
            {
              discoveryConfigurationName: 'project_funding',
              style: 'col-md-8',
              searchType: null,
              initialStatements: 3,
              displayTitle: true,
              componentType: 'search',
            },
          ],
          [
            {
              discoveryConfigurationName: 'project_funding',
              style: 'col-md-12',
              facetsPerRow: 4,
              componentType: 'facet',
            },
          ],
        ],
        type: 'section',
        _links: {
          self: {
            href: 'https://dspacecris7.4science.cloud/server/api/layout/sections/fundings_and_projects',
          },
        },
      },
      {
        id: 'researcherprofiles',
        componentRows: [
          [
            {
              browseNames: ['rpname', 'rpdept'],
              style: 'col-md-4',
              componentType: 'browse',
            },
            {
              discoveryConfigurationName: 'person',
              style: 'col-md-8',
              searchType: null,
              initialStatements: 3,
              displayTitle: true,
              componentType: 'search',
            },
          ],
          [
            {
              discoveryConfigurationName: 'person',
              style: 'col-md-12',
              facetsPerRow: 4,
              componentType: 'facet',
            },
          ],
        ],
        type: 'section',
        _links: {
          self: {
            href: 'https://dspacecris7.4science.cloud/server/api/layout/sections/researcherprofiles',
          },
        },
      },
      {
        id: 'site',
        componentRows: [
          [
            {
              style: 'style',
              content: 'cms.homepage.header',
              contentType: 'text-metadata',
              componentType: 'text-row',
            },
          ],
          [
            {
              discoveryConfigurationName: 'site',
              style: 'col-md-12',
              searchType: 'basic',
              initialStatements: 3,
              displayTitle: false,
              componentType: 'search',
            },
          ],
          [
            {
              style: 'col-md-12 py-4',
              counterSettingsList: [
                {
                  discoveryConfigurationName: 'researchoutputs',
                  icon: 'fas fa-file-alt fa-3x',
                  entityName: 'publications',
                  link: '/explore/researchoutputs',
                },
                {
                  discoveryConfigurationName: 'project_funding',
                  icon: 'fas fa-cogs fa-3x',
                  entityName: 'project_funding',
                  link: '/explore/fundings_and_projects',
                },
                {
                  discoveryConfigurationName: 'person',
                  icon: 'fas fa-users fa-3x',
                  entityName: 'rprofiles',
                  link: '/explore/researcherprofiles',
                },
              ],
              componentType: 'counters',
            },
          ],
          [
            {
              discoveryConfigurationName: 'homePageTopItems',
              sortField: 'dc.date.accessioned',
              order: 'desc',
              style: 'col-md-6',
              titleKey: null,
              numberOfItems: 5,
              showAsCard: true,
              showLayoutSwitch: true,
              defaultLayoutMode: 'card',
              cardStyle: 'border-danger',
              itemListStyle: 'border border-danger p-2',
              cardColumnStyle: 'col-12',
              showAllResults: true,
              componentType: 'top',
            },
            {
              discoveryConfigurationName: 'homePageTopItems',
              sortField: 'metric.view',
              order: 'desc',
              style: 'col-md-6',
              titleKey: null,
              numberOfItems: 5,
              showAsCard: false,
              showLayoutSwitch: true,
              defaultLayoutMode: 'list',
              cardStyle: 'border-danger',
              cardColumnStyle: 'col-12',
              itemListStyle: 'border border-danger p-2',
              showAllResults: true,
              componentType: 'top',
            },
          ],
        ],
        type: 'section',
        _links: {
          self: {
            href: 'https://dspacecris7.4science.cloud/server/api/layout/sections/site',
          },
        },
      },
    ],
  },
  _links: {
    self: {
      href: 'https://dspacecris7.4science.cloud/server/api/layout/sections',
    },
    search: {
      href: 'https://dspacecris7.4science.cloud/server/api/layout/sections/search',
    },
  },
  page: {
    size: 20,
    totalElements: 4,
    totalPages: 1,
    number: 0,
  },
};
