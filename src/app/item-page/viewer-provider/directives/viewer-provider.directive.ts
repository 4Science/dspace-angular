import {
  Directive,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[dsViewerProvider]',
  standalone: true,
})
export class ViewerProviderDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
