import { ItemSearchResult } from '@dspace/core';
import { Collection } from '@dspace/core';
import { Item } from '@dspace/core';
import { createSidebarSearchListElementTests } from '../../../../../shared/object-list/sidebar-search-list-element/sidebar-search-list-element.component.spec';
import { JournalIssueSidebarSearchListElementComponent } from './journal-issue-sidebar-search-list-element.component';

const object = Object.assign(new ItemSearchResult(), {
  indexableObject: Object.assign(new Item(), {
    id: 'test-item',
    metadata: {
      'dc.title': [
        {
          value: 'title',
        },
      ],
      'publicationvolume.volumeNumber': [
        {
          value: '5',
        },
      ],
      'publicationissue.issueNumber': [
        {
          value: '7',
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

describe('JournalIssueSidebarSearchListElementComponent',
  createSidebarSearchListElementTests(JournalIssueSidebarSearchListElementComponent, object, parent, 'parent title', 'title', '5 - 7'),
);
