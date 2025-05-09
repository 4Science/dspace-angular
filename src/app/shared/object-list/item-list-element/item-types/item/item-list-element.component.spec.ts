import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { ItemSearchResultListElementComponent } from 'src/app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { TestDataService } from 'src/app/shared/testing/test-data-service.mock';

import {
  APP_CONFIG,
  APP_DATA_SERVICES_MAP,
} from '../../../../../../config/app-config.interface';
import { environment } from '../../../../../../environments/environment.test';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '../../../../../core/data/feature-authorization/authorization-data.service';
import { Item } from '../../../../../core/shared/item.model';
import { ITEM } from '../../../../../core/shared/item.resource-type';
import { METRIC } from '../../../../../core/shared/metric.resource-type';
import { XSRFService } from '../../../../../core/xsrf/xsrf.service';
import { DSONameServiceMock } from '../../../../mocks/dso-name.service.mock';
import { getMockThemeService } from '../../../../mocks/theme-service.mock';
import { ActivatedRouteStub } from '../../../../testing/active-router.stub';
import { AuthServiceStub } from '../../../../testing/auth-service.stub';
import { AuthorizationDataServiceStub } from '../../../../testing/authorization-service.stub';
import { TruncatableServiceStub } from '../../../../testing/truncatable-service.stub';
import { ThemeService } from '../../../../theme-support/theme.service';
import { TruncatableService } from '../../../../truncatable/truncatable.service';
import { TruncatePipe } from '../../../../utils/truncate.pipe';
import { ItemListElementComponent } from './item-list-element.component';

const mockItem: Item = Object.assign(new Item(), {
  bundles: observableOf({}),
  entityType: 'Publication',
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
    'dc.contributor.author': [
      {
        language: 'en_US',
        value: 'Smith, Donald',
      },
    ],
    'dc.publisher': [
      {
        language: 'en_US',
        value: 'a publisher',
      },
    ],
    'dc.date.issued': [
      {
        language: 'en_US',
        value: '2015-06-26',
      },
    ],
    'dc.description.abstract': [
      {
        language: 'en_US',
        value: 'This is the abstract',
      },
    ],
  },
});

const mockDataServiceMap: any = new Map([
  [ITEM.value, () => import('../../../../../shared/testing/test-data-service.mock').then(m => m.TestDataService)],
  [METRIC.value, () => import('../../../../../shared/testing/test-data-service.mock').then(m => m.TestDataService)],
]);

describe('ItemListElementComponent', () => {
  let comp: ItemListElementComponent;
  let fixture: ComponentFixture<ItemListElementComponent>;

  let activatedRoute: ActivatedRouteStub;
  let authService: AuthServiceStub;
  let authorizationService: AuthorizationDataServiceStub;
  let themeService: ThemeService;
  let truncatableService: TruncatableServiceStub;

  beforeEach(waitForAsync(() => {
    activatedRoute = new ActivatedRouteStub();
    authService = new AuthServiceStub();
    authorizationService = new AuthorizationDataServiceStub();
    themeService = getMockThemeService();
    truncatableService = new TruncatableServiceStub();

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        TruncatePipe,
      ],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: APP_CONFIG, useValue: environment },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AuthService, useValue: authService },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ThemeService, useValue: themeService },
        { provide: TruncatableService, useValue: truncatableService },
        { provide: XSRFService, useValue: {} },
        { provide: APP_DATA_SERVICES_MAP, useValue: mockDataServiceMap },
        provideMockStore(),
        TestDataService,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).overrideComponent(ItemSearchResultListElementComponent, {
      set: {
        template: '<div>Mock Item Search Result List Element</div>',
      },
    })
      .compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemListElementComponent);
    comp = fixture.componentInstance;
  }));

  describe(`when the publication is rendered`, () => {
    beforeEach(() => {
      comp.object = mockItem;
      comp.ngOnChanges();
      fixture.detectChanges();
    });

    it(`should contain a PublicationListElementComponent`, () => {
      const publicationListElement = fixture.debugElement.query(By.css(`ds-item-search-result-list-element`));
      expect(publicationListElement).not.toBeNull();
    });
  });
});
