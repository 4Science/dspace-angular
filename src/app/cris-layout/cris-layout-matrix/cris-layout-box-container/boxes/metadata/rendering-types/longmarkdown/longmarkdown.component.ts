import { Component, OnInit } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the markdown metadata fields with a show more button
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-longmarkdown]',
  templateUrl: './longmarkdown.component.html',
  styleUrls: ['./longmarkdown.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.LONGMARKDOWN)
export class LongmarkdownComponent extends RenderingTypeValueModelComponent implements OnInit {

  /**
   * Id for truncable component
   */
  truncatableId: string;

  ngOnInit(): void {
    this.truncatableId = `${this.item.id}_${this.field.metadata}_md`;
  }
}
