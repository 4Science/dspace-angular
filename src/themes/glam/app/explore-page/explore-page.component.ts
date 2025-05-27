import { Component } from '@angular/core';

import { ExplorePageComponent as BaseComponent } from '../../../../app/explore-page/explore-page.component';

/**
 * Component representing the explore section.
 */
@Component({
  selector: 'ds-themed-explore',
  styleUrls: ['./explore-page.component.scss'],
  templateUrl: './explore-page.component.html',
  standalone: true,
})
export class ExplorePageComponent extends BaseComponent {}
