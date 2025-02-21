import { ItemSearchResult } from '@dspace/core';
import { Collection } from '@dspace/core';
import { Item } from '@dspace/core';
import { createSidebarSearchListElementTests } from '../../../../../shared/object-list/sidebar-search-list-element/sidebar-search-list-element.component.spec';
import { JournalSidebarSearchListElementComponent } from './journal-sidebar-search-list-element.component';

const object = Object.assign(new ItemSearchResult(), {
  indexableObject: Object.assign(new Item(), {
    id: 'test-item',
    metadata: {
      'dc.title': [
        {
          value: 'title',
        },
      ],
      'creativeworkseries.issn': [
        {
          value: '1234',
        },
        {
          value: '5678',
        },
      ],
    },
  }),
});
const parent = Object.assign(new Collection(), {
  id: 'test-collection',
  metadata: {
    'dc.title': [
      {
        value: 'parent title',
      },
    ],
  },
});

describe('JournalSidebarSearchListElementComponent',
  createSidebarSearchListElementTests(JournalSidebarSearchListElementComponent, object, parent, 'parent title', 'title', '1234, 5678'),
);
