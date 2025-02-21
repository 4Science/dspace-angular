import { AdminNotifySearchResultComponent } from '../../../../admin/admin-notify-dashboard/admin-notify-search-result/admin-notify-search-result.component';
import { AdminNotifySearchResult } from '../../../../../../modules/core/src/lib/core/admin/admin-notify-message/models/admin-notify-message-search-result.model';
import { Context } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { getTabulatableObjectsComponent } from './tabulatable-objects.decorator';

describe('TabulatableObject decorator function', () => {

  it('should return the matching class', () => {
    const component = getTabulatableObjectsComponent([AdminNotifySearchResult], ViewMode.Table, Context.CoarNotify);
    expect(component).toEqual(AdminNotifySearchResultComponent);
  });
});
