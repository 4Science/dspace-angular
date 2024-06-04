import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  EnvironmentInjector,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TextSelectionTooltipComponent } from './text-selection-tooltip/text-selection-tooltip.component';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[dsTextSelectTooltip]',
})
export class TextSelectDirective implements OnInit, OnDestroy {

  @Input()
  showTTSControls = true;

  hasSelection = false;
  selectedText = '';

  componentRef: ComponentRef<any> = null;

  // Initialize the directive.
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private elementRef: ElementRef,
    private zone: NgZone,
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {
  }

  // Clean up when the directive is destroyed.
  ngOnDestroy(): void {
    this.elementRef.nativeElement.removeEventListener('mousedown', this.handleMousedown, false);
    this._document.removeEventListener('mouseup', this.handleMouseup, false);
  }

  // Set up event listeners when the directive is initialized.
  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.elementRef.nativeElement.addEventListener('mousedown', this.handleMousedown, false);
    });
  }

  // Get the deepest Element node in the DOM tree that contains the entire range.
  getRangeContainer(range: Range): Node {
    let container = range.commonAncestorContainer;
    while (container.nodeType !== Node.ELEMENT_NODE) {
      container = container.parentNode;
    }
    return (container);
  }

  // Handle mousedown events inside the current element.
  handleMousedown = (): void => {
    this._document.addEventListener('mouseup', this.handleMouseup, false);
  };

  // Handle mouseup events anywhere in the document.
  private handleMouseup = (): void => {
    this._document.removeEventListener('mouseup', this.handleMouseup, false);
    this.processSelection();
  };

  createTooltipComponent(): ComponentRef<TextSelectionTooltipComponent> {
    return createComponent(TextSelectionTooltipComponent, {environmentInjector: this.injector});
  }

  processSelection(): void {
    const selection = this._document.getSelection();
    const stringSelection = selection.toString().trim();
    const previousSelection = this.selectedText;

    if (this.hasSelection) {
      this.zone.runGuarded(() => {
        this.hasSelection = false;
        this.selectedText = '';
        this.componentRef.destroy();
        this.componentRef = null;
      });
    }

    // check if there is a selection and if it is different from the previous one
    // (to handle a bug in browsers that fires the mouseup event again if clicking on the selection)
    if (!selection.rangeCount || !stringSelection || previousSelection === stringSelection) {
      return;
    }
    console.warn('selection', stringSelection);
    let range = selection.getRangeAt(0);
    let rangeContainer = this.getRangeContainer(range);
    // check if the range container is inside the current element
    // (to avoid showing the tooltip when selecting text in other elements)
    if (this.elementRef.nativeElement.contains(rangeContainer)) {
      let viewportRectangle = range.getBoundingClientRect();
      if (stringSelection) {
        this.zone.runGuarded(() => {
          this.hasSelection = true;
          if (this.componentRef === null) {
            this.componentRef = this.createTooltipComponent();
            this.appRef.attachView(this.componentRef.hostView);

            const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
            this._document.body.appendChild(domElem);

            this.componentRef.instance.elementRectangleLeft = viewportRectangle.left + window.scrollX;
            this.componentRef.instance.elementRectangleTop = viewportRectangle.top + window.scrollY;
            this.componentRef.instance.elementRectangleWidth = viewportRectangle.width;
            this.componentRef.instance.elementRectangleHeight = viewportRectangle.height;
            this.componentRef.instance.text = stringSelection;

            this.componentRef.instance.showTTSControls = this.showTTSControls;

            this.selectedText = stringSelection;
          }
        });
      }
    }
  }
}
