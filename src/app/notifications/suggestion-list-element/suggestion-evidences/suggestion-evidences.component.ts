import { Component, Input } from '@angular/core';
import { fadeIn } from '../../../shared/animations/fade';
import { SuggestionEvidences } from '../../../core/notifications/suggestions/models/suggestion.model';


/**
 * Show suggestion evidences such as score (authorScore, dateScore)
 */
@Component({
  selector: 'ds-suggestion-evidences',
  templateUrl: './suggestion-evidences.component.html',
  animations: [fadeIn]
})
export class SuggestionEvidencesComponent {

  @Input() evidences: SuggestionEvidences;

}
