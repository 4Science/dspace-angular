import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-submission-legend',
  templateUrl: './submission-legend.component.html',
  styleUrls: ['./submission-legend.component.scss'],
  imports: [TranslateModule],
})
export class SubmissionLegendComponent {
  legendText = 'submission.sections.general.legend';
}
