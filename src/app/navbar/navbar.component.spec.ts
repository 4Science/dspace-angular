import {
  Injector,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import {
  AppState,
  storeModuleConfig,
} from '../app.reducer';
import { BrowseByDataType } from '@dspace/core';
import { authReducer } from '@dspace/core';
import { AuthTokenInfo } from '@dspace/core';
import { BrowseService } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { buildPaginatedList } from '@dspace/core';
import { FlatBrowseDefinition } from '@dspace/core';
import { HierarchicalBrowseDefinition } from '@dspace/core';
import { Item } from '@dspace/core';
import { ValueListBrowseDefinition } from '@dspace/core';
import {
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '@dspace/core';
import { EPersonMock } from '@dspace/core';
import { HostWindowServiceStub } from '@dspace/core';
import { MenuServiceStub } from '@dspace/core';
import { HostWindowService } from '../shared/host-window.service';
import { MenuService } from '../shared/menu/menu.service';
import { getMockThemeService } from '../shared/mocks/theme-service.mock';
import { ThemeService } from '../shared/theme-support/theme.service';
import { NavbarComponent } from './navbar.component';

let comp: NavbarComponent;
let fixture: ComponentFixture<NavbarComponent>;
let store: Store<AppState>;
let initialState: any;

const authorizationService = jasmine.createSpyObj('authorizationService', {
  isAuthorized: observableOf(true),
});

const mockItem = Object.assign(new Item(), {
  id: 'fake-id',
  uuid: 'fake-id',
  handle: 'fake/handle',
  lastModified: '2018',
  _links: {
    self: {
      href: 'https://localhost:8000/items/fake-id',
    },
  },
});

const routeStub = {
  data: observableOf({
    dso: createSuccessfulRemoteDataObject(mockItem),
  }),
  children: [],
};



describe('NavbarComponent', () => {
  const menuService = new MenuServiceStub();
  let browseDefinitions;
  // waitForAsync beforeEach
  beforeEach(waitForAsync(() => {
    browseDefinitions = [
      Object.assign(
        new FlatBrowseDefinition(), {
          id: 'title',
          dataType: BrowseByDataType.Title,
        },
      ),
      Object.assign(
        new FlatBrowseDefinition(), {
          id: 'dateissued',
          dataType: BrowseByDataType.Date,
          metadataKeys: ['dc.date.issued'],
        },
      ),
      Object.assign(
        new ValueListBrowseDefinition(), {
          id: 'author',
          dataType: BrowseByDataType.Metadata,
        },
      ),
      Object.assign(
        new ValueListBrowseDefinition(), {
          id: 'subject',
          dataType: BrowseByDataType.Metadata,
        },
      ),
      Object.assign(
        new HierarchicalBrowseDefinition(), {
          id: 'srsc',
        },
      ),
    ];
    initialState = {
      core: {
        auth: {
          authenticated: true,
          loaded: true,
          blocking: false,
          loading: false,
          authToken: new AuthTokenInfo('test_token'),
          userId: EPersonMock.id,
          authMethods: [],
        },
      },
    };

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        StoreModule.forRoot({ auth: authReducer }, storeModuleConfig),
        NoopAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NavbarComponent,
      ],
      providers: [
        Injector,
        { provide: ThemeService, useValue: getMockThemeService() },
        { provide: MenuService, useValue: menuService },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(800) },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: BrowseService, useValue: { getBrowseDefinitions: createSuccessfulRemoteDataObject$(buildPaginatedList(undefined, browseDefinitions)) } },
        { provide: AuthorizationDataService, useValue: authorizationService },
        provideMockStore({ initialState }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();  // compile template and css
  }));

  // synchronous beforeEach
  beforeEach(() => {
    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(NavbarComponent);

    comp = fixture.componentInstance;

  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });


});
