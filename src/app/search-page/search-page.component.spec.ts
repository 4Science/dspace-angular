import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { SearchPageComponent } from './search-page.component';
import { SEARCH_CONFIG_SERVICE } from '../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { APP_CONFIG } from '../../config/app-config.interface';
import { environment } from '../../environments/environment.test';
import { ViewMode } from '../core/shared/view-mode.model';

describe('SearchPageComponent', () => {
  let comp: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  const searchConfigServiceStub = jasmine.createSpyObj('SearchConfigurationService', {
    getCurrentConfiguration: jasmine.createSpy('getCurrentConfiguration'),
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [SearchPageComponent],
      providers: [
        { provide: SearchConfigurationService, useValue: searchConfigServiceStub },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(SearchPageComponent, {
      set: {
        providers: [
          { provide: SEARCH_CONFIG_SERVICE, useValue: searchConfigServiceStub },
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should set the initial view mode from the searchPage preferred display view configuration', () => {
    expect(comp.initViewMode).toBe(ViewMode.GridElement);
  });
});
