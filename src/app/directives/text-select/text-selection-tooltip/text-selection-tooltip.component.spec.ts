import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextSelectionTooltipComponent } from './text-selection-tooltip.component';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NativeWindowService } from '../../../core/services/window.service';

describe('TextSelectionTooltipComponent', () => {
  let component: TextSelectionTooltipComponent;
  let fixture: ComponentFixture<TextSelectionTooltipComponent>;
  let changeDetectorRef: ChangeDetectorRef;
  let ngZone: NgZone;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TextSelectionTooltipComponent ],
      providers: [
        { provide: ChangeDetectorRef, useValue: {detectChanges: () => fixture.detectChanges()} },
        { provide: NgZone, useValue: new NgZone({}) },
        { provide: TranslateService, useValue: { currentLang: 'en' } },
        { provide: NativeWindowService, useValue: { nativeWindow: window } },
      ]
    });

    fixture = TestBed.createComponent(TextSelectionTooltipComponent);
    component = fixture.componentInstance;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef);
    ngZone = TestBed.inject(NgZone);
    translateService = TestBed.inject(TranslateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up event listener on ngOnInit', () => {
    spyOn(window, 'addEventListener');
    component.ngOnInit();
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', component.boundCheckPosition);
  });

  it('should remove event listener on ngOnDestroy', () => {
    spyOn(window, 'removeEventListener');
    component.ngOnDestroy();
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', component.boundCheckPosition);
  });

  it('should check position correctly', () => {
    spyOn(changeDetectorRef, 'detectChanges');
    component.elementRectangleTop = 100;
    component.elementRectangleHeight = 50;
    spyOnProperty(window, 'scrollY').and.returnValue(200);
    component.checkPosition();
    expect(component.top).toBe(156);
    expect(component.bottomPlacement).toBeTrue();
  });

  it('should handle text to speech correctly', () => {
    spyOn(window.speechSynthesis, 'speak');
    component.text = 'test';
    component.textToSpeech();
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it('should handle pause text to speech correctly', () => {
    spyOn(window.speechSynthesis, 'pause');
    component.pauseTextToSpeech();
    expect(window.speechSynthesis.pause).toHaveBeenCalled();
    expect(component.isPaused).toBeTrue();
  });

  it('should handle resume text to speech correctly', () => {
    spyOn(window.speechSynthesis, 'resume');
    component.resumeTextToSpeech();
    expect(window.speechSynthesis.resume).toHaveBeenCalled();
    expect(component.isPaused).toBeFalse();
  });
});
