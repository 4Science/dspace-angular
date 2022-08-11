import { Component } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the markdown metadata fields
 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'div[ds-markdown]',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.MARKDOWN)
export class MarkdownComponent extends RenderingTypeValueModelComponent {

  /**
   * Id for truncable component
   */
  truncableId: string;

  ngOnInit(): void {
    this.truncableId = `${this.item.id}_${this.field.metadata}`;
  }
}
