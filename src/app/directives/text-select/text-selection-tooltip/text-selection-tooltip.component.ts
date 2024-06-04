import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit
} from '@angular/core';
import { NgIf } from '@angular/common';
import { NativeWindowRef, NativeWindowService } from '../../../core/services/window.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ds-text-selection-tooltip',
  templateUrl: './text-selection-tooltip.component.html',
  styleUrls: ['./text-selection-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf
  ],
  standalone: true
})
export class TextSelectionTooltipComponent implements OnInit, OnDestroy {

  private readonly tooltipOffset = 6;

  @Input()
  showTTSControls = true;

  @Input()
  elementRectangleLeft = 0;

  @Input()
  elementRectangleTop = 0;

  @Input()
  elementRectangleWidth = 0;

  @Input()
  elementRectangleHeight = 0;

  @Input()
  text: string;

  @HostBinding('style.left.px')
  left: number;

  @HostBinding('style.top.px')
  top: number;

  @HostBinding('style.right.px')
  right: number;

  @HostBinding('class.bottom-placement')
  bottomPlacement = false;

  utterances: SpeechSynthesisUtterance[] = [];
  isPaused = false;

  boundCheckPosition = this.checkPosition.bind(this);

  constructor(
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private translate: TranslateService) {

  }

  ngOnInit(): void {
    this.left = this.elementRectangleLeft + this.elementRectangleWidth / 2;
    this.checkPosition();
    this.ngZone.runOutsideAngular(() => {
      // listen to scroll event to update position
      this._window.nativeWindow.addEventListener('scroll', this.boundCheckPosition);
    });
  }

  checkPosition() {
    if (this.elementRectangleTop < this._window.nativeWindow.scrollY) {
      this.top = this.elementRectangleTop + this.elementRectangleHeight + this.tooltipOffset;
      this.bottomPlacement = true;
    } else {
      this.top = this.elementRectangleTop - this.tooltipOffset;
      this.bottomPlacement = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  // listen to mousedown on host element to avoid clearing selection
  @HostListener('mousedown', ['$event'])
  public handleMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  public textToSpeech(): void {
    if (this.utterances.length) {
      speechSynthesis.cancel();
    }
    // split the text in phrases (ending with . or ! or ?), include any leftover text
    const phrases = this.text.match(/[^.!?]+[.!?]?/g);
    this.utterances = phrases.map(phrase => new SpeechSynthesisUtterance(phrase));
    this.utterances.forEach((utterance, i) => {
      utterance.lang = this.translate.currentLang;
      utterance.onend = () => {
        if (i < this.utterances.length - 1) {
          speechSynthesis.speak(this.utterances[i + 1]);
        } else {
          this.utterances = [];
          this.changeDetectorRef.detectChanges();
        }
      };
    });
    speechSynthesis.speak(this.utterances[0]);
  }

  ngOnDestroy(): void {
    if (this.utterances.length) {
      speechSynthesis.cancel();
    }
    this._window.nativeWindow.removeEventListener('scroll', this.boundCheckPosition);
  }

  pauseTextToSpeech() {
    speechSynthesis.pause();
    this.isPaused = true;
  }

  resumeTextToSpeech() {
    speechSynthesis.resume();
    this.isPaused = false;
  }
}
