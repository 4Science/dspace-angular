import {
  NgFor,
  NgIf,
} from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  CrisLayoutBox,
  LayoutField,
  LayoutFieldType,
  MetadataBoxCell,
  MetadataBoxRow,
} from '../../../../../../core/layout/models/box.model';
import { Item } from '../../../../../../core/shared/item.model';
import { isNotEmpty } from '../../../../../../shared/empty.util';
import { MetadataContainerComponent } from './metadata-container/metadata-container.component';

/**
 * This component renders the rows of metadata boxes
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[ds-row]',
  templateUrl: './row.component.html',
  styleUrls: ['./row.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, MetadataContainerComponent],
})
export class RowComponent {

  /**
   * Current DSpace Item
   */
  @Input() item: Item;
  /**
   * Current layout box
   */
  @Input() box: CrisLayoutBox;
  /**
   * Current row configuration
   */
  @Input() row: MetadataBoxRow;

  trackUpdate(index, field: LayoutField) {
    return field && field.metadata;
  }

  trackCellUpdate(index, cell: MetadataBoxCell) {
    return cell && cell.fields;
  }

  hasVisibleFields(cell: MetadataBoxCell): boolean {
    return (cell?.fields ?? []).some((field: LayoutField) => this.isFieldVisible(field));
  }

  private isFieldVisible(field: LayoutField): boolean {
    switch (field?.fieldType) {
      case LayoutFieldType.METADATA.toString():
        return isNotEmpty(this.item.firstMetadataValue(field.metadata));
      case LayoutFieldType.METADATAGROUP.toString():
        return (field.metadataGroup?.elements ?? []).some((el: LayoutField) => isNotEmpty(this.item.metadata?.[el.metadata]));
      default:
        return true;
    }
  }

}
