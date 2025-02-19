import { createSuccessfulRemoteDataObject$ } from '../../../../../../../modules/shared/utils/src/lib/utils/remote-data.utils';
import { buildPaginatedList } from '../../../../../core/data/paginated-list.model';
import { Item } from '../../../../../core/shared/item.model';
import { PageInfo } from '../../../../../core/shared/page-info.model';
import { ItemSearchResult } from '../../../../../shared/object-collection/shared/item-search-result.model';
import { getEntityGridElementTestComponent } from '../../../../../shared/object-grid/search-result-grid-element/item-search-result/item/item-search-result-grid-element.component.spec';
import { JournalVolumeSearchResultGridElementComponent } from './journal-volume-search-result-grid-element.component';

const mockItemWithMetadata: ItemSearchResult = new ItemSearchResult();
mockItemWithMetadata.hitHighlights = {};
mockItemWithMetadata.indexableObject = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'creativework.datePublished': [
      {
        language: null,
        value: '2015-06-26',
      },
    ],
    'dc.description': [
      {
        language: 'en_US',
        value: 'A description for the journal volume',
      },
    ],
  },
});

const mockItemWithoutMetadata: ItemSearchResult = new ItemSearchResult();
mockItemWithoutMetadata.hitHighlights = {};
mockItemWithoutMetadata.indexableObject = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
  },
});

describe('JournalVolumeSearchResultGridElementComponent', getEntityGridElementTestComponent(JournalVolumeSearchResultGridElementComponent, mockItemWithMetadata, mockItemWithoutMetadata, ['date', 'description']));
