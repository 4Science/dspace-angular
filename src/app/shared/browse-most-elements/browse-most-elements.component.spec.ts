import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TopSectionTemplateType } from '../../core/layout/models/section.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowseMostElementsComponent } from './browse-most-elements.component';
import { By } from '@angular/platform-browser';

describe('BrowseMostElementsComponent', () => {
  let component: BrowseMostElementsComponent;
  let fixture: ComponentFixture<BrowseMostElementsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BrowseMostElementsComponent],
      providers: [
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseMostElementsComponent);
    component = fixture.componentInstance;
    component.topSection = {
      template: TopSectionTemplateType.DEFAULT
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when the templateType is DEFAULT', () => {
    beforeEach(() => {
      component.topSection = {
        template: TopSectionTemplateType.DEFAULT
      } as any;
      fixture.detectChanges();
    });

    it('should display ds-themed-default-browse-elements', () => {
      const defaultElement = fixture.debugElement.query(By.css('ds-themed-default-browse-elements'));
      expect(defaultElement).toBeTruthy();
    });

    it('should not display ds-themed-images-browse-elements', () => {
      const imageElement = fixture.debugElement.query(By.css('ds-themed-images-browse-elements'));
      expect(imageElement).toBeNull();
    });
  });

  describe('when the templateType is IMAGE', () => {
    beforeEach(() => {
      component.topSection = null;
      component.topSection = {
        template: TopSectionTemplateType.IMAGES
      } as any;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display ds-themed-images-browse-elements', () => {
      const imageElement = fixture.debugElement.query(By.css('ds-themed-images-browse-elements'));
      expect(imageElement).toBeTruthy();
    });

    it('should not display ds-themed-default-browse-elements', () => {
      const defaultElement = fixture.debugElement.query(By.css('ds-themed-default-browse-elements'));
      expect(defaultElement).toBeNull();
    });
  });

  describe('when the templateType is not recognized', () => {
    beforeEach(() => {
      component.topSection = {
        template: 'not recognized' as any
      } as any;
      fixture.detectChanges();
    });

    it('should display ds-themed-default-browse-elements', () => {
      const defaultElement = fixture.debugElement.query(By.css('ds-themed-default-browse-elements'));
      expect(defaultElement).toBeTruthy();
    });
  });
});
