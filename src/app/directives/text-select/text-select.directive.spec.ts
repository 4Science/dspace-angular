import { TextSelectDirective } from './text-select.directive';
import { ApplicationRef, ElementRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

describe('TextSelectDirective', () => {
  let directive: TextSelectDirective;
  let elementRef: ElementRef;
  let ngZone: NgZone;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TextSelectDirective,
        { provide: Document, useExisting: DOCUMENT },
        { provide: ApplicationRef, useValue: { attachView: () => ({ rootNodes: [{}] }) } },
        { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
        { provide: NgZone, useValue: new NgZone({}) },
      ]
    });

    directive = TestBed.inject(TextSelectDirective);
    elementRef = TestBed.inject(ElementRef);
    ngZone = TestBed.inject(NgZone);
    appRef = TestBed.inject(ApplicationRef);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should set up event listener on ngOnInit', () => {
    spyOn(elementRef.nativeElement, 'addEventListener');
    directive.ngOnInit();
    expect(elementRef.nativeElement.addEventListener).toHaveBeenCalledWith('mousedown', directive.handleMousedown, false);
  });

  it('should remove event listener on ngOnDestroy', () => {
    spyOn(elementRef.nativeElement, 'removeEventListener');
    directive.ngOnDestroy();
    expect(elementRef.nativeElement.removeEventListener).toHaveBeenCalledWith('mousedown', directive.handleMousedown, false);
  });

  it('should process selection correctly', () => {
    const selection = {
      rangeCount: 1,
      toString: () => 'test',
      getRangeAt: () => ({ getBoundingClientRect: () => ({}) }),
    };
    spyOn(document, 'getSelection').and.returnValue(selection as any);
    spyOn(directive, 'getRangeContainer').and.returnValue(elementRef.nativeElement);
    spyOn(elementRef.nativeElement, 'contains').and.returnValue(true);
    spyOn(directive, 'createTooltipComponent').and.returnValue({ instance: {}, hostView: {rootNodes: []} } as any);
    spyOn(document.body, 'appendChild').and.returnValue({} as Node);
    spyOn(appRef, 'attachView').and.returnValue();

    directive.processSelection();

    expect(directive.hasSelection).toBeTrue();
    expect(directive.selectedText).toBe('test');
    expect(directive.componentRef).toBeTruthy();
  });
});
