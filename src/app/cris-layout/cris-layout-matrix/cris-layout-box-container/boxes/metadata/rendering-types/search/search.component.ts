import {Component, Inject, OnInit} from '@angular/core';
import {Router, UrlTree} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {LayoutField} from '../../../../../../../core/layout/models/box.model';
import {Item} from '../../../../../../../core/shared/item.model';
import {MetadataValue} from '../../../../../../../core/shared/metadata.models';
import {ResolverStrategyService} from '../../../../../../services/resolver-strategy.service';

import {FieldRenderingType, MetadataBoxFieldRendering} from '../metadata-box.decorator';
import {RenderingTypeValueModelComponent} from '../rendering-type-value.model';

/**
 * This component renders the search metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-search]',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.SEARCH)
export class SearchComponent extends RenderingTypeValueModelComponent implements OnInit {

  /**
   * the query params to use to build the search query to be used in the link
   */
  searchQueryParams: any = {};

  constructor(
    @Inject('fieldProvider') public fieldProvider: LayoutField,
    @Inject('itemProvider') public itemProvider: Item,
    @Inject('metadataValueProvider') public metadataValueProvider: MetadataValue,
    @Inject('renderingSubTypeProvider') public renderingSubTypeProvider: string,
    protected resolver: ResolverStrategyService,
    protected translateService: TranslateService,
    private router: Router
  ) {
    super(fieldProvider, itemProvider, metadataValueProvider, renderingSubTypeProvider, translateService);
  }

  ngOnInit(): void {
    const searchHrefLink = this.getSearchHrefLink(this.field.rendering, this.renderingSubType, this.field.metadata, this.metadataValue.value);
    this.searchQueryParams = this.getHrefQueryParams(searchHrefLink);
  }

  getHrefQueryParams(url) {
    const tree: UrlTree = this.router.parseUrl(url);
    return tree.queryParams;
  }

}
