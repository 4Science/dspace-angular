import {Component, Input, OnInit,} from '@angular/core';
import { fadeInOut } from '../../../animations/fade';
import { Item } from '../../../../core/shared/item.model';
import { getItemPageRoute } from '../../../../item-page/item-page-routing-paths';
import {DSONameService} from '../../../../core/breadcrumbs/dso-name.service';

@Component({
  selector: 'ds-associate-items-list-preview',
  templateUrl: './associate-items-list-preview.component.html',
  styleUrls: ['./associate-items-list-preview.component.scss'],
  animations: [fadeInOut]
})
export class AssociateItemsListPreviewComponent implements OnInit{

  /**
   * The item to display
   */
  @Input() item: Item;

  /**
   * The custom information object
   */
  @Input() customData: any;

  /**
   * A string used for specifying the type of view which the component is being used for
   */
  @Input() viewConfig = 'default';

  @Input() showLabel = false;

  @Input() showThumbnails = false;

  processing = false;

  dsoTitle: string;

  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  public constructor( protected dsoNameService: DSONameService) {
    //
  }

  ngOnInit(): void {
    this.itemPageRoute = getItemPageRoute(this.item);
    this.dsoTitle = this.dsoNameService.getName(this.item);
  }
}
