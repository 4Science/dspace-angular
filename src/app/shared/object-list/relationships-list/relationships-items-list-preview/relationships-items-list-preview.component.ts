import {
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BtnDisabledDirective } from 'src/app/shared/btn-disabled.directive';

import { environment } from '../../../../../environments/environment';
import { Item } from '../../../../core/shared/item.model';
import {
  ManageRelationshipEvent,
  ManageRelationshipEventType,
} from '../../../../edit-item-relationships/edit-item-relationship-types';
import { fadeInOut } from '../../../animations/fade';
import { MetadataLinkViewComponent } from '../../../metadata-link-view/metadata-link-view.component';
import { ThemedTypeBadgeComponent } from '../../../object-collection/shared/badges/type-badge/themed-type-badge.component';
import { ItemSubmitterComponent } from '../../../object-collection/shared/mydspace-item-submitter/item-submitter.component';
import { TruncatableComponent } from '../../../truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../truncatable/truncatable-part/truncatable-part.component';

@Component({
  selector: 'ds-relationships-items-list-preview',
  templateUrl: './relationships-items-list-preview.component.html',
  styleUrls: ['./relationships-items-list-preview.component.scss'],
  animations: [fadeInOut],
  imports: [
    ThemedTypeBadgeComponent,
    TruncatableComponent,
    TruncatablePartComponent,
    NgIf,
    NgClass,
    TranslateModule,
    MetadataLinkViewComponent,
    NgForOf,
    ItemSubmitterComponent,
    BtnDisabledDirective,
  ],
  standalone: true,
})
export class RelationshipsItemsListPreviewComponent {

  /**
   * The item to display
   */
  @Input() item: Item;

  /**
   * The custom information object
   */
  @Input() customData: any;

  /**
   * A boolean representing whether to show submitter information
   */
  @Input() showSubmitter = false;

  /**
   * A string used for specifying the type of view which the component is being used for
   */
  @Input() viewConfig = 'default';

  /**
   * A boolean representing whether the drag-and-drop handle should be hidden
   */
  @Input() pendingChanges = false;

  /**
   * Emit when trying to delete the relationship
   */
  @Output() deleteRelationship = new EventEmitter<ManageRelationshipEvent>();

  processing = false;

  authorMetadata = environment.searchResult.authorMetadata;
  /**
   * When a button is clicked emit the event to the parent components
   */
  dispatchDelete(): void {
    this.processing = true;
    this.deleteRelationship.emit({
      action: ManageRelationshipEventType.Unselect,
      item: this.item,
      relationship: this.customData.relationship,
    });
  }
}
