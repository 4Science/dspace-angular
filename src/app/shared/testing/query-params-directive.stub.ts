import {
  Directive,
  Input,
} from '@angular/core';

/* eslint-disable @angular-eslint/directive-class-suffix */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[queryParams]',
})
export class QueryParamsDirectiveStub {
  @Input() queryParams: any;
}
