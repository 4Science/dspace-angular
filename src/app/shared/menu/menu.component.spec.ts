// eslint-disable-next-line max-classes-per-file
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Store,
  StoreModule,
} from '@ngrx/store';
import {
  MockStore,
  provideMockStore,
} from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  of as observableOf,
} from 'rxjs';

import {
  AppState,
  storeModuleConfig,
} from '../../app.reducer';
import { authReducer } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { Item } from '@dspace/core';
import { createSuccessfulRemoteDataObject } from '@dspace/core';
import { getMockThemeService } from '../mocks/theme-service.mock';
import { ThemeService } from '../theme-support/theme.service';
import { MenuComponent } from './menu.component';
import { MenuService } from './menu.service';
import { MenuID } from '@dspace/core';
import { LinkMenuItemModel } from './menu-item/models/link.model';
import { MenuItemType } from '@dspace/core';
import { rendersSectionForMenu } from './menu-section.decorator';
import { MenuSection } from '@dspace/core';

const mockMenuID = 'mock-menuID' as MenuID;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
@rendersSectionForMenu(mockMenuID, true)
class TestExpandableMenuComponent {
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
@rendersSectionForMenu(mockMenuID, false)
class TestMenuComponent {
}

describe('MenuComponent', () => {
  let comp: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let menuService: MenuService;
  let store: MockStore;

  const mockStatisticSection = { 'id': 'statistics_site', 'active': true, 'visible': true, 'index': 2, 'type': 'statistics', 'model': { 'type': 1, 'text': 'menu.section.statistics', 'link': 'statistics' } };

  let authorizationService: AuthorizationDataService;

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

  const initialState = {
    menus: {
      [mockMenuID]: {
        collapsed: true,
        id: mockMenuID,
        previewCollapsed: true,
        sectionToSubsectionIndex: {
          section1: [],
        },
        sections: {
          section1: {
            id: 'section1',
            active: false,
            visible: true,
            model: {
              type: MenuItemType.LINK,
              text: 'test',
              link: '/test',
            } as LinkMenuItemModel,
          },
        },
        visible: true,
      },
    },
  };

  beforeEach(waitForAsync(() => {

    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(false),
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), NoopAnimationsModule, RouterTestingModule, MenuComponent, StoreModule.forRoot(authReducer, storeModuleConfig)],
      providers: [
        Injector,
        { provide: ThemeService, useValue: getMockThemeService() },
        MenuService,
        provideMockStore({ initialState }),
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ActivatedRoute, useValue: routeStub },
        TestExpandableMenuComponent,
        TestMenuComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(MenuComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    comp = fixture.componentInstance; // SearchPageComponent test instance
    comp.menuID = mockMenuID;
    menuService = TestBed.inject(MenuService);
    store = TestBed.inject(Store) as MockStore<AppState>;
    spyOn(comp as any, 'getSectionDataInjector').and.returnValue(MenuSection);
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should trigger the section observable again when a new sub section has been added', () => {
      spyOn(comp.sectionMap$, 'next').and.callThrough();
      const hasSubSections = new BehaviorSubject(false);
      spyOn(menuService, 'hasSubSections').and.returnValue(hasSubSections.asObservable());
      spyOn(store, 'dispatch').and.callThrough();

      store.setState({
        menus: {
          [mockMenuID]: {
            collapsed: true,
            id: mockMenuID,
            previewCollapsed: true,
            sectionToSubsectionIndex: {
              section1: ['test'],
            },
            sections: {
              section1: {
                id: 'section1',
                active: false,
                visible: true,
                model: {
                  type: MenuItemType.LINK,
                  text: 'test',
                  link: '/test',
                } as LinkMenuItemModel,
              },
              test: {
                id: 'test',
                parentID: 'section1',
                active: false,
                visible: true,
                model: {
                  type: MenuItemType.LINK,
                  text: 'test',
                  link: '/test',
                } as LinkMenuItemModel,
              },
            },
            visible: true,
          },
        },
      });
      expect(menuService.hasSubSections).toHaveBeenCalled();
      hasSubSections.next(true);

      expect(comp.sectionMap$.next).toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    beforeEach(() => {
      spyOn(menuService, 'toggleMenu');
      comp.toggle(new Event('click'));
    });
    it('should trigger the toggleMenu function on the menu service', () => {
      expect(menuService.toggleMenu).toHaveBeenCalledWith(comp.menuID);
    });
  });

  describe('expand', () => {
    beforeEach(() => {
      spyOn(menuService, 'expandMenu');
      comp.expand(new Event('click'));
    });
    it('should trigger the expandMenu function on the menu service', () => {
      expect(menuService.expandMenu).toHaveBeenCalledWith(comp.menuID);
    });
  });

  describe('collapse', () => {
    beforeEach(() => {
      spyOn(menuService, 'collapseMenu');
      comp.collapse(new Event('click'));
    });
    it('should trigger the collapseMenu function on the menu service', () => {
      expect(menuService.collapseMenu).toHaveBeenCalledWith(comp.menuID);
    });
  });

  describe('expandPreview', () => {
    it('should trigger the expandPreview function on the menu service after 100ms', fakeAsync(() => {
      spyOn(menuService, 'expandMenuPreview');
      comp.expandPreview(new Event('click'));
      tick(99);
      expect(menuService.expandMenuPreview).not.toHaveBeenCalled();
      tick(1);
      expect(menuService.expandMenuPreview).toHaveBeenCalledWith(comp.menuID);
    }));
  });

  describe('collapsePreview', () => {
    it('should trigger the collapsePreview function on the menu service after 400ms', fakeAsync(() => {
      spyOn(menuService, 'collapseMenuPreview');
      comp.collapsePreview(new Event('click'));
      tick(399);
      expect(menuService.collapseMenuPreview).not.toHaveBeenCalled();
      tick(1);
      expect(menuService.collapseMenuPreview).toHaveBeenCalledWith(comp.menuID);
    }));
  });

  describe('when unauthorized statistics', () => {

    beforeEach(() => {
      (authorizationService as any).isAuthorized.and.returnValue(observableOf(false));
      fixture.detectChanges();
    });

    it('should return observable of empty object', done => {
      comp.getAuthorizedStatistics(mockStatisticSection).subscribe((res) => {
        expect(res).toEqual({});
        done();
      });
    });
  });

  describe('get authorized statistics', () => {

    beforeEach(() => {
      (authorizationService as any).isAuthorized.and.returnValue(observableOf(true));
      fixture.detectChanges();
    });

    it('should return observable of statistics section menu', done => {
      comp.getAuthorizedStatistics(mockStatisticSection).subscribe((res) => {
        expect(res).toEqual(mockStatisticSection);
        done();
      });
    });
  });

});
