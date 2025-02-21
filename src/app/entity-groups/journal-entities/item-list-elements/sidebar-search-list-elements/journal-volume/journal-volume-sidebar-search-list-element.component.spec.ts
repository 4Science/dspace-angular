import { ItemSearchResult } from '@dspace/core';
import { Collection } from '@dspace/core';
import { Item } from '@dspace/core';
import { createSidebarSearchListElementTests } from '../../../../../shared/object-list/sidebar-search-list-element/sidebar-search-list-element.component.spec';
import { JournalVolumeSidebarSearchListElementComponent } from './journal-volume-sidebar-search-list-element.component';

const object = Object.assign(new ItemSearchResult(), {
  indexableObject: Object.assign(new Item(), {
    id: 'test-item',
    metadata: {
      'dc.title': [
        {
          value: 'title',
        },
      ],
      'journal.title': [
        {
          value: 'journal title',
        },
      ],
      'publicationvolume.volumeNumber': [
        {
          value: '1',
        },
        {
          value: '2',
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

describe('JournalVolumeSidebarSearchListElementComponent',
  createSidebarSearchListElementTests(JournalVolumeSidebarSearchListElementComponent, object, parent, 'parent title', 'title', 'journal title (1) (2)'),
);
