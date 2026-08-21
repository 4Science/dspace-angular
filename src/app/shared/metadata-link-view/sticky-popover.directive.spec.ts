import {
  Component,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

import { StickyPopoverDirective } from './sticky-popover.directive';

/** Minimal host component to exercise the directive */
@Component({
  imports: [
    NgbPopoverModule,
    StickyPopoverDirective,
  ],
  template: `
    <ng-template #tpl>
      <a href="#" id="popover-link">popover link</a>
    </ng-template>
    <span id="trigger" [dsStickyPopover]="tpl" [stickyPopoverClickable]="clickable">trigger</span>
  `,
})
class TestHostComponent {
  @ViewChild('tpl') tpl: TemplateRef<any>;
  clickable = false;
}

describe('StickyPopoverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let trigger: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent, RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.debugElement.query(By.css('#trigger')).nativeElement;
  });

  afterEach(() => {
    document.querySelectorAll('.popover').forEach(el => el.remove());
  });

  function getPopover(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.popover.show');
  }

  function mouseenter() {
    trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
  }

  function mouseleave() {
    trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();
  }

  function click() {
    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
  }

  it('should create the directive', () => {
    const dir = fixture.debugElement
      .query(By.directive(StickyPopoverDirective))
      .injector.get(StickyPopoverDirective);
    expect(dir).toBeTruthy();
  });

  it('should not show popover initially', () => {
    expect(getPopover()).toBeNull();
  });

  it('should open popover on mouseenter', () => {
    mouseenter();
    expect(getPopover()).not.toBeNull();
  });

  it('should close popover on mouseleave after delay', fakeAsync(() => {
    mouseenter();
    expect(getPopover()).not.toBeNull();

    mouseleave();
    tick(200);
    fixture.detectChanges();

    expect(getPopover()).toBeNull();
  }));

  it('should keep popover open when mouse moves over the popover content', fakeAsync(() => {
    mouseenter();
    const popover = getPopover()!;

    popover.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    mouseleave();
    tick(200);
    fixture.detectChanges();

    expect(getPopover()).not.toBeNull();
  }));

  it('should close popover when mouse leaves the popover content', fakeAsync(() => {
    mouseenter();
    const popover = getPopover()!;

    popover.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    mouseleave();
    tick(200);

    popover.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
    tick(200);
    fixture.detectChanges();

    expect(getPopover()).toBeNull();
  }));

  it('should close popover on click when stickyPopoverClickable is false', fakeAsync(() => {
    mouseenter();
    expect(getPopover()).not.toBeNull();

    click();
    tick(200);
    fixture.detectChanges();

    expect(getPopover()).toBeNull();
  }));

  describe('when stickyPopoverClickable is true', () => {
    beforeEach(() => {
      host.clickable = true;
      fixture.detectChanges();
    });

    it('should pin popover open on first click', fakeAsync(() => {
      mouseenter();
      click();
      mouseleave();
      tick(200);
      fixture.detectChanges();

      expect(getPopover()).not.toBeNull();
    }));

    it('should unpin and close popover on second click', fakeAsync(() => {
      mouseenter();
      click();
      click();

      tick(200);
      fixture.detectChanges();

      expect(getPopover()).toBeNull();
    }));

    it('should close and unpin popover when Escape is pressed inside it', fakeAsync(() => {
      mouseenter();
      click();

      const popover = getPopover()!;
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      popover.dispatchEvent(escEvent);
      tick(200);
      fixture.detectChanges();

      expect(getPopover()).toBeNull();
    }));

    it('should close and unpin when focus moves outside the popover', fakeAsync(() => {
      mouseenter();
      click();

      const popover = getPopover()!;
      const focusOutEvent = new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: trigger,
      });
      popover.dispatchEvent(focusOutEvent);
      tick(200);
      fixture.detectChanges();

      expect(getPopover()).toBeNull();
    }));
  });

  it('should close popover when Escape is pressed on the trigger', fakeAsync(() => {
    mouseenter();
    expect(getPopover()).not.toBeNull();

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    tick(200);
    fixture.detectChanges();

    expect(getPopover()).toBeNull();
  }));
});

