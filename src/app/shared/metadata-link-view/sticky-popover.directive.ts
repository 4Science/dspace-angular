import {
  DOCUMENT,
  isPlatformBrowser,
} from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  NavigationStart,
  Router,
} from '@angular/router';
import {
  NgbPopover,
  NgbPopoverConfig,
} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

/**
 * Directive to create a sticky popover using NgbPopover.
 * The popover remains open when the mouse is over its content and closes when the mouse leaves.
 */
@Directive({
  selector: '[dsStickyPopover]',
})
export class StickyPopoverDirective extends NgbPopover implements OnInit, OnDestroy {
  /** Template for the sticky popover content */
  @Input() dsStickyPopover: TemplateRef<any>;

  /**
   * When true, clicking the trigger also toggles the popover open/closed,
   * in addition to the default hover behaviour.
   */
  @Input() stickyPopoverClickable = false;

  /** Subscriptions to manage router events */
  subs: Subscription[] = [];

  /** Flag to determine if the popover can be closed */
  private canClosePopover: boolean;

  /** Reference to the element the directive is applied to */
  private readonly _elRef;

  /** Renderer to listen to and manipulate DOM elements */
  private readonly _render;

  /** Flag tracking whether the popover was pinned open by a click */
  private pinnedByClick = false;

  /** Reference to the document object (works in both browser and SSR) */
  private readonly document: Document;

  /** Platform identifier to check if running in browser */
  private readonly isBrowser: boolean;

  /** Reference to the popover element */
  private popoverElement: HTMLElement | null = null;

  constructor(
    _elementRef: ElementRef<HTMLElement>,
    _renderer: Renderer2, injector: Injector,
    viewContainerRef: ViewContainerRef,
    config: NgbPopoverConfig,
    _ngZone: NgZone,
    @Inject(DOCUMENT) _document: Document,
    _changeDetector: ChangeDetectorRef,
    applicationRef: ApplicationRef,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    super(_elementRef, _renderer, injector, viewContainerRef, config, _ngZone, _document, _changeDetector, applicationRef);
    this._elRef = _elementRef;
    this._render = _renderer;
    this.document = _document;
    this.isBrowser = isPlatformBrowser(platformId);
    this.triggers = 'manual';
    this.container = 'body';
  }

  /**
   * Sets up event listeners for mouse enter, mouse leave, and click events.
   */
  ngOnInit(): void {
    super.ngOnInit();
    this.ngbPopover = this.dsStickyPopover;

    // Only set up event listeners in browser environment
    if (!this.isBrowser) {
      return;
    }

    this._render.listen(this._elRef.nativeElement, 'mouseenter', () => {
      this.canClosePopover = true;
      this.open();
    });

    this._render.listen(this._elRef.nativeElement, 'mouseleave', () => {
      setTimeout(() => {
        if (this.canClosePopover && !this.pinnedByClick) {
          this.close();
        }
      }, this.closeDelay ?? 100);
    });

    this._render.listen(this._elRef.nativeElement, 'click', () => {
      if (this.stickyPopoverClickable) {
        if (this.pinnedByClick) {
          // Second click: unpin and close
          this.pinnedByClick = false;
          this.close();
        } else {
          // First click: pin open
          this.pinnedByClick = true;
          this.canClosePopover = false;
          this.open();
        }
      } else {
        this.close();
      }
    });

    // Allow Escape to close from the trigger element
    this._render.listen(this._elRef.nativeElement, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.pinnedByClick = false;
        this.close();
      }
    });

    this.subs.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.pinnedByClick = false;
          // Immediately hide the popover to prevent it from jumping to the corner
          if (this.popoverElement) {
            this._render.setStyle(this.popoverElement, 'display', 'none');
          }
          this.close();
        }
      }),
    );
  }

  /**
   * Opens the popover and sets up event listeners for mouse over and mouse out events on the popover.
   */
  open() {
    super.open();
    // Only access DOM in browser environment
    if (!this.isBrowser) {
      return;
    }

    const popover = this.document.querySelector<HTMLElement>('.popover');
    if (!popover) {
      return;
    }
    this.popoverElement = popover;

    this._render.listen(popover, 'mouseover', () => {
      this.canClosePopover = false;
    });

    this._render.listen(popover, 'mouseout', () => {
      this.canClosePopover = true;
      setTimeout(() => {
        if (this.canClosePopover && !this.pinnedByClick) {
          this.close();
        }
      }, 0);
    });

    // When pinned by click: move focus into the popover and close when focus leaves it
    if (this.pinnedByClick) {
      const firstFocusable = popover.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        popover.setAttribute('tabindex', '-1');
        popover.focus();
      }

      // Close and unpin when focus moves outside the popover
      this._render.listen(popover, 'focusout', (event: FocusEvent) => {
        const relatedTarget = event.relatedTarget as Node | null;
        if (!relatedTarget || !popover.contains(relatedTarget)) {
          this.pinnedByClick = false;
          this.close();
        }
      });

      // Escape key closes and returns focus to trigger
      this._render.listen(popover, 'keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.pinnedByClick = false;
          this.close();
          this._elRef.nativeElement.focus();
        }
      });
    }
  }

  /**
   * Closes the popover and clears the element reference.
   */
  override close(): void {
    super.close();
    this.popoverElement = null;
  }

  /**
   * Unsubscribes from all subscriptions when the directive is destroyed.
   */
  ngOnDestroy() {
    super.ngOnDestroy();
    this.subs.forEach((sub) => sub.unsubscribe());
  }
}
