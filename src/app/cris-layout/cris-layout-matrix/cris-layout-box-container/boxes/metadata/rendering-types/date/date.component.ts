import { Component } from '@angular/core';

import { DsDatePipe } from '../../../../../../pipes/ds-date.pipe';
import {
  FieldRenderingType,
  MetadataBoxFieldRendering,
} from '../metadata-box.decorator';
import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the date metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'span[ds-date]',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  standalone: true,
  imports: [DsDatePipe],
})
@MetadataBoxFieldRendering(FieldRenderingType.DATE)
export class DateComponent extends RenderingTypeValueModelComponent {

}
