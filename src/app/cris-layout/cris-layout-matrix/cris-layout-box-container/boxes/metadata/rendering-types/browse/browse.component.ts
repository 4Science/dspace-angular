import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RenderingTypeValueModelComponent } from '../rendering-type-value.model';

/**
 * This component renders the browse metadata fields
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[ds-browse]',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})
export class BrowseComponent extends RenderingTypeValueModelComponent {

}
