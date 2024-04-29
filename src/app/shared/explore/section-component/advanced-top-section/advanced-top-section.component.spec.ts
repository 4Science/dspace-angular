import { AdvancedTopSection, AdvancedTopSectionTemplateType } from './../../../../core/layout/models/section.model';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedTopSectionComponent } from './advanced-top-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { HostWindowService, WidthCategory } from '../../../host-window.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('AdvancedTopSectionComponent', () => {
  let component: AdvancedTopSectionComponent;
  let fixture: ComponentFixture<AdvancedTopSectionComponent>;
  const hostWindowServiceStub = {
    isIn: (widthCatArray: [WidthCategory]) => of(true)
  };

  const topAdvancedSection: AdvancedTopSection = {
    discoveryConfigurationName: ['project', 'publication', 'author'],
    sortField: 'ASC',
    order: 'ASC',
     style: '',
    componentType: 'advanced-top-component',
    numberOfItems: 8,
    template: AdvancedTopSectionTemplateType.SLIDER,
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AdvancedTopSectionComponent],
      providers: [
        { provide: HostWindowService, useValue: hostWindowServiceStub },
        ChangeDetectorRef
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedTopSectionComponent);
    component = fixture.componentInstance;
    component.advancedTopSection = topAdvancedSection;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change discovery configuration', () => {
    const configName = 'project';
    component.changeDiscovery(configName);
    expect(component.selectedDiscoverConfiguration).toEqual(configName);
    expect(component.paginatedSearchOptions.configuration).toEqual(configName);
  });

  it('should display the discovery configuration buttons', () => {
    const discoveryButtons = fixture.debugElement.queryAll(By.css('.btn-group button'));
    expect(discoveryButtons.length).toEqual(component.advancedTopSection.discoveryConfigurationName.length);
  });

  describe('when clicking on an arrow button', () => {
    beforeEach(() => {

      component.paginatedSearchOptions = {
        pagination: {
          currentPage: 1,
        },
      } as any;
      spyOn(component, 'changeDiscovery');
      fixture.detectChanges();
    });

    it('should change page if at start when scrolling left', () => {
      component.scrollLeft();
      expect(component.changeDiscovery).toHaveBeenCalledWith(component.selectedDiscoverConfiguration, 0);
    });

    it('should change page if at end when scrolling right', () => {
      component.scrollRight();
      expect(component.changeDiscovery).toHaveBeenCalledWith(component.selectedDiscoverConfiguration, 2);
    });
  });

  it('should calculate reachedEnd correctly', () => {
    component.paginatedSearchOptions = {
      pagination: {
        currentPage: 1,
      },
    } as any;
    component.totalNumberOfElements.next(1);
    component.maxNumberOfItems = 8;
    component.initialNumberOfElementsPerPage = 2;
    expect(component.reachedEnd).toBeTrue();
  });
});
