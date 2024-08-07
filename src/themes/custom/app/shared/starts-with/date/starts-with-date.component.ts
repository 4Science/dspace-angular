import { Component } from '@angular/core';

import { StartsWithDateComponent as BaseComponent } from '../../../../../../app/shared/starts-with/date/starts-with-date.component';
import {
  renderStartsWithFor,
  StartsWithType,
} from '../../../../../../app/shared/starts-with/starts-with-decorator';

@Component({
  selector: 'ds-starts-with-date',
  // styleUrls: ['./starts-with-date.component.scss'],
  styleUrls: ['../../../../../../app/shared/starts-with/date/starts-with-date.component.scss'],
  // templateUrl: './starts-with-date.component.html',
  templateUrl: '../../../../../../app/shared/starts-with/date/starts-with-date.component.html',
})
@renderStartsWithFor(StartsWithType.date)
export class StartsWithDateComponent extends BaseComponent {
}
