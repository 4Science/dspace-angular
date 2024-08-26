import { AdvancedTopSection, TopSectionTemplateType } from '../../../../core/layout/models/section.model';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedTopSectionComponent } from './advanced-top-section.component';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { HostWindowService, WidthCategory } from '../../../host-window.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import {SearchService} from '../../../../core/shared/search/search.service';
import {createSuccessfulRemoteDataObject$} from '../../../remote-data.utils';
import {DSpaceObject} from '../../../../core/shared/dspace-object.model';

describe('AdvancedTopSectionComponent', () => {
  let component: AdvancedTopSectionComponent;
  let fixture: ComponentFixture<AdvancedTopSectionComponent>;

  const dso = Object.assign(new DSpaceObject(), {});
  const hostWindowServiceStub = {
    isIn: (widthCatArray: [WidthCategory]) => of(true),
    isXs: () => of(false)
  };

  const searchService = jasmine.createSpyObj('searchService', {
    search: createSuccessfulRemoteDataObject$(dso),
  });

  const topAdvancedSection: AdvancedTopSection = {
    defaultLayoutMode: undefined,
    showAllResults: false,
    showAsCard: false,
    showLayoutSwitch: false,
    showThumbnails: false,
    titleKey: '',
    discoveryConfigurationName: ['project', 'publication', 'author'],
    sortField: 'ASC',
    order: 'ASC',
     style: '',
    componentType: 'advanced-top-component',
    numberOfItems: 8,
    template: TopSectionTemplateType.SLIDER
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [AdvancedTopSectionComponent],
      providers: [
        { provide: HostWindowService, useValue: hostWindowServiceStub },
        { provide: SearchService, useValue: searchService },
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

  it('should display the discovery configuration buttons', () => {
    const mockResults = component.advancedTopSection.discoveryConfigurationName.map(() => 1);
    spyOn(component, 'getSearchResultTotalNumber').and.callFake((configName: string) => {
      const index = component.advancedTopSection.discoveryConfigurationName.indexOf(configName);
      return of(mockResults[index]);
    });
    fixture.detectChanges();
    const discoveryButtons = fixture.debugElement.queryAll(By.css('.btn-group button'));
    const buttonsToDisplay: number = [...component.discoveryConfigurationsTotalElementsMap.values()].filter((total) => total > 0).length;
    expect(discoveryButtons.length).toEqual(buttonsToDisplay);
  });

  it('should not display the discovery configuration buttons when there are no results', () => {
    spyOn(component, 'getSearchResultTotalNumber').and.returnValue(of(0));
    fixture.detectChanges();
    const discoveryButtons = fixture.debugElement.queryAll(By.css('.btn-group button'));
    expect(discoveryButtons.length).toEqual(0);
  });
});
