import { getTestScheduler } from 'jasmine-marbles';

import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { Item } from '../shared/item.model';
import { editItemBreadcrumbResolver } from './edit-item-breadcrumb.resolver';

describe('editItemBreadcrumbResolver', () => {
  describe('resolve', () => {
    let resolver: any;
    let dsoBreadcrumbService: any;
    let itemService: any;
    let testItem: Item;
    let uuid;
    let breadcrumbUrl;
    let currentUrl;

    beforeEach(() => {
      uuid = '1234-65487-12354-1235';
      breadcrumbUrl = `/items/${uuid}`;
      currentUrl = `/edititems/${uuid}`;
      testItem = Object.assign(new Item(), {
        uuid: uuid,
        type: 'item',
      });
      dsoBreadcrumbService = {};
      itemService = {
        findById: jasmine.createSpy('findById').and.returnValue(createSuccessfulRemoteDataObject$(testItem)),
      };
      resolver = editItemBreadcrumbResolver;
    });

    it('should resolve a breadcrumb config for the item when the route id is a plain uuid', () => {
      const resolvedConfig = resolver({ params: { id: uuid } } as any, { url: currentUrl } as any, dsoBreadcrumbService, itemService);
      const expectedConfig = { provider: dsoBreadcrumbService, key: testItem, url: breadcrumbUrl };
      getTestScheduler().expectObservable(resolvedConfig).toBe('(a|)', { a: expectedConfig });
      getTestScheduler().flush();
      expect(itemService.findById.calls.mostRecent().args.slice(0, 2)).toEqual([uuid, true]);
    });

    it('should strip the workspace/workflow item id suffix before resolving, when the route id is composite', () => {
      const compositeId = `${uuid}:12345`;
      const resolvedConfig = resolver({ params: { id: compositeId } } as any, { url: currentUrl } as any, dsoBreadcrumbService, itemService);
      const expectedConfig = { provider: dsoBreadcrumbService, key: testItem, url: breadcrumbUrl };
      getTestScheduler().expectObservable(resolvedConfig).toBe('(a|)', { a: expectedConfig });
      getTestScheduler().flush();
      expect(itemService.findById.calls.mostRecent().args.slice(0, 2)).toEqual([uuid, true]);
    });
  });
});
