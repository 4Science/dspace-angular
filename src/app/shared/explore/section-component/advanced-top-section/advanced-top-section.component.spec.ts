import { SortDirection } from './../../../../core/cache/models/sort-options.model';
import { Context } from 'src/app/core/shared/context.model';
import { AdvancedTopSection, LayoutModeEnum } from './../../../../core/layout/models/section.model';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedTopSectionComponent } from './advanced-top-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterMock } from 'src/app/shared/mocks/router.mock';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HostWindowService } from '../../../host-window.service';
import { HostWindowServiceStub } from '../../../testing/host-window-service.stub';

describe('AdvancedTopSectionComponent', () => {
  let component: AdvancedTopSectionComponent;
  let fixture: ComponentFixture<AdvancedTopSectionComponent>;

  const sectionMock: AdvancedTopSection = {
    discoveryConfigurationName: ['project', 'publication', 'author'],

    sortField: 'ASC',
    order: 'ASC',
    endlessHorizontalScroll: true,
    componentType: 'advanced-top-component'
  } as any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule],
      declarations: [AdvancedTopSectionComponent],
      providers: [
        { provide: Router, useValue: new RouterMock() },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(800) },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedTopSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.context).toEqual(Context.BrowseMostElements);
    expect(component.showThumbnails).toEqual(false);
    expect(component.layoutMode).toEqual(LayoutModeEnum.CARD);
    expect(component.numberOfItems).toEqual(6);
    expect(component.sortDirection).toEqual(SortDirection.ASC);
  });

  it('should change discovery configuration', () => {
    const configName = 'project';
    component.changeDiscovery(configName);
    expect(component.selectedDiscoverConfiguration).toEqual(configName);
    expect(component.paginatedSearchOptions.configuration).toEqual(configName);
  });

  it('should display the discovery configuration buttons', () => {
    const discoveryButtons = fixture.debugElement.queryAll(By.css('.rounded-pill'));
    expect(discoveryButtons.length).toEqual(component.advancedTopSection.discoveryConfigurationName.length);
  });

  describe('when clicking on an arrow button', () => {
    beforeEach(() => {
      component.scrollContainer = [{
        scrollLeft: 0,
        scrollWidth: 500,
        clientWidth: 300,
        scrollBy: jasmine.createSpy('scrollBy'),
      }] as any;
      component.paginatedSearchOptions = {
        pagination: {
          currentPage: 1,
        },
      } as any;
      spyOn(component, 'changeDiscovery');
      fixture.detectChanges();
    });


    it('should scroll left if not at start', () => {
      component.scrollContainer[0].scrollLeft = 100;
      component.scrollLeft();
      expect(component.scrollContainer[0].scrollBy).toHaveBeenCalled();
      expect(component.changeDiscovery).not.toHaveBeenCalled();
    });


    it('should change page if at start when scrolling left', () => {
      component.scrollLeft();
      expect(component.scrollContainer[0].scrollBy).not.toHaveBeenCalled();
      expect(component.changeDiscovery).toHaveBeenCalledWith(component.selectedDiscoverConfiguration, 0);
    });

    it('should scroll right if not at end', () => {
      component.scrollRight();
      expect(component.scrollContainer[0].scrollBy).toHaveBeenCalled();
      expect(component.changeDiscovery).not.toHaveBeenCalled();
    });

    it('should change page if at end when scrolling right', () => {
      component.scrollContainer[0].scrollLeft = 200;
      component.scrollRight();
      expect(component.scrollContainer[0].scrollLeft).toEqual(0);
      expect(component.changeDiscovery).toHaveBeenCalledWith(component.selectedDiscoverConfiguration, 2);
    });
  });
});
