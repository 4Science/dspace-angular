import { Component } from '@angular/core';
import { StartsWithAbstractComponent } from '../starts-with-abstract.component';

import { hasValue } from '../../empty.util';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StartsWithType, } from '../starts-with-decorator';

/**
 * A switchable component rendering StartsWith options for the type "Text".
 */
@Component({
    selector: 'ds-starts-with-text',
    styleUrls: ['./starts-with-text.component.scss'],
    templateUrl: './starts-with-text.component.html',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, TranslateModule]
})
export class StartsWithTextComponent extends StartsWithAbstractComponent {

  /**
   * Get startsWith as text;
   */
  getStartsWith() {
    if (hasValue(this.startsWith)) {
      return this.startsWith;
    } else {
      return '';
    }
  }

  /**
   * Add/Change the url query parameter startsWith using the local variable
   */
  setStartsWithParam(resetPage = true) {
    if (this.startsWith === '0-9') {
      this.startsWith = '0';
    }
    super.setStartsWithParam(resetPage);
  }

}
