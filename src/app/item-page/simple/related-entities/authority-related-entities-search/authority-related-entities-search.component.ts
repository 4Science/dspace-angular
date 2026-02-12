import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Item } from '@dspace/core/shared/item.model';

import { ThemedConfigurationSearchPageComponent } from '../../../../search-page/themed-configuration-search-page.component';

@Component({
  selector: 'ds-authority-related-entities-search',
  templateUrl: './authority-related-entities-search.component.html',
  imports: [
    ThemedConfigurationSearchPageComponent,
  ],
})
/**
 * A component to show related items as search results, based on authority value
 */
export class AuthorityRelatedEntitiesSearchComponent implements OnInit {
  /**
   * Filter used for set scope in discovery invocation
   */
  searchFilter: string;
  /**
   * Name of configuration for this box
   */
  @Input() configuration: string;
  /**
   * flag for enable/disable search bar
   */
  @Input() searchEnabled = true;


  @Input() item: Item;


  ngOnInit() {
    this.searchFilter = `scope=${this.item.id}`;
  }

}
