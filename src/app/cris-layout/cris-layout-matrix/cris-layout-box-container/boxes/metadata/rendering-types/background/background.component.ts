import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, take } from 'rxjs/operators';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { BitstreamRenderingModelComponent } from '../bitstream-rendering-model';
import { BitstreamDataService } from '../../../../../../../core/data/bitstream-data.service';
import { Bitstream } from '../../../../../../../core/shared/bitstream.model';
import { Item } from '../../../../../../../core/shared/item.model';
import { LayoutField } from '../../../../../../../core/layout/models/box.model';
import { FindListOptions } from '../../../../../../../core/data/find-list-options.model';
import { PaginatedList } from '../../../../../../../core/data/paginated-list.model';

@Component({
  selector: 'ds-background',
  templateUrl: './background.component.html',
  styleUrls: ['./background.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.BACKGROUND, true)
/**
 * The component for displaying a background image from the primary bitstream.
 * The element that should display the background must have the bitstream-background-container class.
 */
export class BackgroundComponent extends BitstreamRenderingModelComponent implements OnInit {

  /**
   * Pagination configuration object
   */
  pageOptions: FindListOptions;

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected bitstreamDataService: BitstreamDataService,
    protected translateService: TranslateService
  ) {
    super(fieldProvider, itemProvider, renderingSubTypeProvider, bitstreamDataService, translateService);
  }

  /**
  * On init download attachment
  */
  ngOnInit() {
    this.initPageOptions();
    this.retrieveBitstreams();
  }

  /**
   * Retrieve the bitstream to show
   */
  retrieveBitstreams(): void {
    this.getBitstreamsByItem(this.pageOptions).pipe(
      map((bitstreamList: PaginatedList<Bitstream>) => {
        return bitstreamList.page;
      }),
      take(1)
    ).subscribe((bitstreams: Bitstream[]) => {
      const element: HTMLElement = document.getElementsByClassName('bitstream-background-container')[0] as HTMLElement;
      if (element) {
        element.style.backgroundImage = `url(${bitstreams[0]._links.content.href})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundRepeat = 'no-repeat';
        element.style.backgroundPosition = 'center';
      }
    });
  }

  /**
   * Init page option for one element only
   * @protected
   */
  protected initPageOptions(): void {
    this.pageOptions = Object.assign(new FindListOptions(), {
      elementsPerPage: 1,
      currentPage: 1
    });
  }
}
