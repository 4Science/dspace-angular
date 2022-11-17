import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dsViewerProvider]'
})
export class ViewerProviderDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
