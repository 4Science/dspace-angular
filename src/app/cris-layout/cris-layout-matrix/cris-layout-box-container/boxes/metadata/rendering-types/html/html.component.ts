import { Component } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the text metadata fields
 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'span[ds-html]',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.HTML)
export class HtmlComponent extends RenderingTypeValueModelComponent {

}
