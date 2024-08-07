import {
  Injector,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { MenuService } from '../../menu/menu.service';
import { MenuItemModel } from '../../menu/menu-item/models/menu-item.model';
import { getMockThemeService } from '../../mocks/theme-service.mock';
import { AuthServiceStub } from '../../testing/auth-service.stub';
import { MenuServiceStub } from '../../testing/menu-service.stub';
import { ThemeService } from '../../theme-support/theme.service';
import { DsoPageModule } from '../dso-page.module';
import { DsoEditMenuComponent } from './dso-edit-menu.component';

describe('DsoEditMenuComponent', () => {
  let comp: DsoEditMenuComponent;
  let fixture: ComponentFixture<DsoEditMenuComponent>;
  const menuService = new MenuServiceStub();
  let authorizationService: AuthorizationDataService;

  const routeStub = {
    children: [],
  };

  const section = {
    id: 'edit-dso',
    active: false,
    visible: true,
    model: {
      type: null,
      disabled: false,
    } as MenuItemModel,
    icon: 'pencil-alt',
    index: 1,
  };


  beforeEach(waitForAsync(() => {
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true),
    });
    spyOn(menuService, 'getMenuTopSections').and.returnValue(observableOf([section]));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule, DsoPageModule],
      declarations: [DsoEditMenuComponent],
      providers: [
        Injector,
        { provide: MenuService, useValue: menuService },
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: ThemeService, useValue: getMockThemeService() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DsoEditMenuComponent);
    comp = fixture.componentInstance;
    comp.sections = observableOf([]);
    fixture.detectChanges();
  });

  describe('onInit', () => {
    it('should create', () => {
      expect(comp).toBeTruthy();
    });
  });
});

