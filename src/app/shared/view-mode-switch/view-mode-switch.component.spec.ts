import {
  ChangeDetectionStrategy,
  Component,
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
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { SearchService } from '../../core/shared/search/search.service';
import { ViewMode } from '../../core/shared/view-mode.model';
import { TranslateLoaderMock } from '../mocks/translate-loader.mock';
import { SearchServiceStub } from '../testing/search-service.stub';
import { ViewModeSwitchComponent } from './view-mode-switch.component';

@Component({
  template: '',
  standalone: true,
})
class DummyComponent {
}

describe('ViewModeSwitchComponent', () => {
  let comp: ViewModeSwitchComponent;
  let fixture: ComponentFixture<ViewModeSwitchComponent>;
  const searchService = new SearchServiceStub();
  let listButton: HTMLElement;
  let gridButton: HTMLElement;
  let detailButton: HTMLElement;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        RouterTestingModule.withRoutes([
          { path: 'search', component: DummyComponent, pathMatch: 'full' },
        ]),
        ViewModeSwitchComponent,
        DummyComponent,
      ],
      providers: [
        { provide: SearchService, useValue: searchService },
      ],
    }).overrideComponent(ViewModeSwitchComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewModeSwitchComponent);
    comp = fixture.componentInstance; // ViewModeSwitchComponent test instance
    spyOn(comp.changeViewMode, 'emit');
  });

  describe('', () => {
    beforeEach(fakeAsync(() => {
      comp.viewModeList = [ViewMode.ListElement, ViewMode.GridElement];
      comp.currentMode = ViewMode.ListElement;
      searchService.setViewMode(ViewMode.ListElement);
      tick();
      fixture.detectChanges();
      const debugElements = fixture.debugElement.queryAll(By.css('button'));
      listButton = debugElements[0].nativeElement;
      gridButton = debugElements[1].nativeElement;
    }));

    it('should set list button as active when on list mode', fakeAsync(() => {
      comp.switchViewTo(ViewMode.ListElement);
      expect(comp.changeViewMode.emit).not.toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(comp.currentMode).toBe(ViewMode.ListElement);
      expect(listButton.classList).toContain('active');
      expect(gridButton.classList).not.toContain('active');

    }));

    it('should set grid button as active when on grid mode', fakeAsync(() => {
      comp.switchViewTo(ViewMode.GridElement);
      expect(comp.changeViewMode.emit).toHaveBeenCalledWith(ViewMode.GridElement);
      tick();
      fixture.detectChanges();
      expect(comp.currentMode).toBe(ViewMode.GridElement);
      expect(listButton.classList).not.toContain('active');
      expect(gridButton.classList).toContain('active');
    }));
  });


  describe('', () => {
    beforeEach(fakeAsync(() => {
      comp.viewModeList = [ViewMode.ListElement, ViewMode.DetailedListElement];
      comp.currentMode = ViewMode.ListElement;
      searchService.setViewMode(ViewMode.ListElement);
      tick();
      fixture.detectChanges();
      const debugElements = fixture.debugElement.queryAll(By.css('button'));
      listButton = debugElements[0].nativeElement;
      detailButton = debugElements[1].nativeElement;
    }));

    it('should set list button as active when on list mode', fakeAsync(() => {
      comp.switchViewTo(ViewMode.ListElement);
      expect(comp.changeViewMode.emit).not.toHaveBeenCalled();
      tick();
      fixture.detectChanges();
      expect(comp.currentMode).toBe(ViewMode.ListElement);
      expect(listButton.classList).toContain('active');
      expect(detailButton.classList).not.toContain('active');
    }));

    it('should set detail button as active when on detailed mode', fakeAsync(() => {
      comp.switchViewTo(ViewMode.DetailedListElement);
      expect(comp.changeViewMode.emit).toHaveBeenCalledWith(ViewMode.DetailedListElement);
      tick();
      fixture.detectChanges();
      expect(comp.currentMode).toBe(ViewMode.DetailedListElement);
      expect(listButton.classList).not.toContain('active');
      expect(detailButton.classList).toContain('active');
    }));
  });

  describe('when disabled', () => {
    let buttons: HTMLElement[];

    beforeEach(fakeAsync(() => {
      comp.viewModeList = [ViewMode.ListElement, ViewMode.GridElement];
      comp.currentMode = ViewMode.ListElement;
      searchService.setViewMode(ViewMode.ListElement);
      comp.disabled = true;
      tick();
      fixture.detectChanges();
      buttons = fixture.debugElement.queryAll(By.css('button')).map((de) => de.nativeElement);
      spyOn(searchService, 'setViewMode').and.callThrough();
    }));

    it('should mark every button as disabled', () => {
      expect(buttons.length).toBe(2);
      buttons.forEach((button: HTMLElement) => {
        expect(button.classList).toContain('disabled');
        expect(button.getAttribute('aria-disabled')).toBe('true');
      });
    });

    it('should not switch the view mode when switchViewTo is called', () => {
      comp.switchViewTo(ViewMode.GridElement);
      expect(comp.changeViewMode.emit).not.toHaveBeenCalled();
      expect(searchService.setViewMode).not.toHaveBeenCalled();
    });

    it('should not switch the view mode when a button is clicked', fakeAsync(() => {
      buttons[1].click();
      tick();
      fixture.detectChanges();
      expect(comp.changeViewMode.emit).not.toHaveBeenCalled();
      expect(searchService.setViewMode).not.toHaveBeenCalled();
      expect(comp.currentMode).toBe(ViewMode.ListElement);
    }));

    it('should switch the view mode again once re-enabled', fakeAsync(() => {
      comp.disabled = false;
      fixture.detectChanges();
      buttons.forEach((button: HTMLElement) => {
        expect(button.classList).not.toContain('disabled');
        expect(button.getAttribute('aria-disabled')).toBe('false');
      });

      comp.switchViewTo(ViewMode.GridElement);
      tick();
      expect(comp.changeViewMode.emit).toHaveBeenCalledWith(ViewMode.GridElement);
      expect(searchService.setViewMode).toHaveBeenCalled();
    }));
  });

});
