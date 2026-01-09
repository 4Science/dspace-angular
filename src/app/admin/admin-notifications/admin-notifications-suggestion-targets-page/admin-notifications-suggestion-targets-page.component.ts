import { Component } from '@angular/core';

import { PublicationClaimComponent } from '../../../notifications/suggestions/targets/publication-claim/publication-claim.component';


@Component({
  selector: 'ds-admin-notifications-reciter-page',
  templateUrl: './admin-notifications-suggestion-targets-page.component.html',
  styleUrls: ['./admin-notifications-suggestion-targets-page.component.scss'],
  imports: [
    PublicationClaimComponent,
  ],
})
export class AdminNotificationsSuggestionTargetsPageComponent {

}
