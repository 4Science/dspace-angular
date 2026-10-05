import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { APP_CONFIG } from '../../config/app-config.interface';
import { environment } from '../../environments/environment.test';
import { SearchConfigurationService } from '../core/shared/search/search-configuration.service';
import { SEARCH_CONFIG_SERVICE } from '../my-dspace-page/my-dspace-configuration.service';
import { ThemedSearchComponent } from '../shared/search/themed-search.component';
import { SearchPageComponent } from './search-page.component';

describe('SearchPageComponent', () => {
  let comp: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  const searchConfigServiceStub = jasmine.createSpyObj('SearchConfigurationService', {
    getCurrentConfiguration: jasmine.createSpy('getCurrentConfiguration'),
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        SearchPageComponent,
      ],
      providers: [
        { provide: SearchConfigurationService, useValue: searchConfigServiceStub },
        { provide: APP_CONFIG, useValue: environment },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(SearchPageComponent, {
        set: {
          providers: [
            { provide: SEARCH_CONFIG_SERVICE, useValue: searchConfigServiceStub },
          ],
        },
      })
      .overrideComponent(SearchPageComponent, {
        remove: {
          imports: [ThemedSearchComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should expose the searchPage preferred search result view configuration', () => {
    expect(comp.searchResultViewConfig).toBe(environment.search.preferredContextConfig.searchPage);
  });
});
