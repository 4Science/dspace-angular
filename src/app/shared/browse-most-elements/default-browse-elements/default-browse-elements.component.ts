import { ViewMode } from '../../../core/shared/view-mode.model';
import { LayoutModeEnum } from '../../../core/layout/models/section.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { PaginatedList } from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import { Component, OnChanges } from '@angular/core';
import { AbstractBrowseElementsComponent } from '../abstract-browse-elements.component';
import { isPlatformServer } from '@angular/common';
import { followLink } from '../../utils/follow-link-config.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { SearchResult } from '../../search/models/search-result.model';
import isEqual from 'lodash/isEqual';

@Component({
  selector: 'ds-default-browse-elements',
  templateUrl: './default-browse-elements.component.html',
  styleUrls: ['./default-browse-elements.component.scss']
})
export class DefaultBrowseElementsComponent extends AbstractBrowseElementsComponent implements OnChanges {

  ngOnChanges(): void {
    this.getAllBitstreams();
  }

  private getAllBitstreams() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const showThumbnails = this.showThumbnails ?? this.appConfig.browseBy.showThumbnails;
    const followLinks = showThumbnails ? [followLink('thumbnail')] : [];
    this.searchService.search(this.paginatedSearchOptions, null, true, true, ...followLinks).pipe(
      getFirstCompletedRemoteData(),
    ).subscribe((response: RemoteData<PaginatedList<SearchResult<DSpaceObject>>>) => {
      // this.totalElements.emit(response.payload?.totalElements ?? 0);
      this.searchResults = response;
      this.cdr.detectChanges();
    });
  }

  showAllResults() {
    const view = isEqual(this.mode, LayoutModeEnum.LIST)
      ? ViewMode.ListElement
      : ViewMode.GridElement;
    this.router.navigate(['/search'], {
      queryParams: {
        configuration: this.paginatedSearchOptions.configuration,
        view: view,
      },
      replaceUrl: true,
    });
  }
}
