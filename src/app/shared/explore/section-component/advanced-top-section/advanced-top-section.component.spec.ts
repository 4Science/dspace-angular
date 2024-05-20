import { AdvancedTopSection, TopSectionTemplateType } from '../../../../core/layout/models/section.model';
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
    isIn: (widthCatArray: [WidthCategory]) => of(true),
    isXs: () => of(false)
  };

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

  // TODO fix test
  // it('should change discovery configuration', () => {
  //   const configName = 'project';
  //   component.selectDiscoveryConfiguration(configName);
  //   expect(component.selectedDiscoverConfiguration).toEqual(configName);
  //   expect(component.paginatedSearchOptions.configuration).toEqual(configName);
  // });

  it('should display the discovery configuration buttons', () => {
    const discoveryButtons = fixture.debugElement.queryAll(By.css('.btn-group button'));
    expect(discoveryButtons.length).toEqual(component.advancedTopSection.discoveryConfigurationName.length);
  });

});
