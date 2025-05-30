import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ConfigurationDataService } from '../../../core/data/configuration-data.service';
import { AuthorizationDataService } from '../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../core/data/feature-authorization/feature-id';
import { GroupDataService } from '../../../core/eperson/group-data.service';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { LinkHeadService } from '../../../core/services/link-head.service';
import { ConfigurationProperty } from '../../../core/shared/configuration-property.model';
import { Item } from '../../../core/shared/item.model';
import { SearchConfigurationService } from '../../../core/shared/search/search-configuration.service';
import { BtnDisabledDirective } from '../../btn-disabled.directive';
import { ErrorComponent } from '../../error/error.component';
import { HostWindowService } from '../../host-window.service';
import { ThemedLoadingComponent } from '../../loading/themed-loading.component';
import { PaginationComponent } from '../../pagination/pagination.component';
import { PaginationComponentOptions } from '../../pagination/pagination-component-options.model';
import { createSuccessfulRemoteDataObject$ } from '../../remote-data.utils';
import { HostWindowServiceStub } from '../../testing/host-window-service.stub';
import { ObjectSelectServiceStub } from '../../testing/object-select-service.stub';
import { PaginationServiceStub } from '../../testing/pagination-service.stub';
import { SearchConfigurationServiceStub } from '../../testing/search-configuration-service.stub';
import { createPaginatedList } from '../../testing/utils.test';
import { ObjectSelectService } from '../object-select.service';
import { ItemSelectComponent } from './item-select.component';

describe('ItemSelectComponent', () => {
  let comp: ItemSelectComponent;
  let fixture: ComponentFixture<ItemSelectComponent>;
  let objectSelectService: ObjectSelectService;
  let paginationService;

  const mockItemList = [
    Object.assign(new Item(), {
      id: 'id1',
      bundles: of({}),
      metadata: [
        {
          key: 'dc.title',
          language: 'en_US',
          value: 'This is just a title',
        },
        {
          key: 'dc.type',
          language: null,
          value: 'Article',
        }],
      _links: { self: { href: 'selfId1' } },
    }),
    Object.assign(new Item(), {
      id: 'id2',
      bundles: of({}),
      metadata: [
        {
          key: 'dc.title',
          language: 'en_US',
          value: 'This is just another title',
        },
        {
          key: 'dc.type',
          language: null,
          value: 'Article',
        }],
      _links: { self: { href: 'selfId2' } },
    }),
  ];
  const mockItems = createSuccessfulRemoteDataObject$(createPaginatedList(mockItemList));
  const mockPaginationOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'search-page-configuration',
    pageSize: 10,
    currentPage: 1,
  });

  paginationService = new PaginationServiceStub(mockPaginationOptions);

  const authorizationDataService = new AuthorizationDataService(null, null, null, null, null);

  const linkHeadService = jasmine.createSpyObj('linkHeadService', {
    addTag: '',
  });

  const groupDataService = jasmine.createSpyObj('groupsDataService', {
    findListByHref: createSuccessfulRemoteDataObject$(createPaginatedList([])),
    getGroupRegistryRouterLink: '',
    getUUIDFromString: '',
  });

  const configurationDataService = jasmine.createSpyObj('configurationDataService', {
    findByPropertyName: createSuccessfulRemoteDataObject$(Object.assign(new ConfigurationProperty(), {
      name: 'test',
      values: [
        'org.dspace.ctask.general.ProfileFormats = test',
      ],
    })),
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterTestingModule.withRoutes([]), BtnDisabledDirective],
      providers: [
        { provide: ObjectSelectService, useValue: new ObjectSelectServiceStub([mockItemList[1].id]) },
        { provide: HostWindowService, useValue: new HostWindowServiceStub(0) },
        { provide: PaginationService, useValue: paginationService },
        { provide: AuthorizationDataService, useValue: authorizationDataService },
        { provide: GroupDataService, useValue: groupDataService },
        { provide: LinkHeadService, useValue: linkHeadService },
        { provide: ConfigurationDataService, useValue: configurationDataService },
        { provide: SearchConfigurationService, useValue: new SearchConfigurationServiceStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemSelectComponent, { remove: { imports: [PaginationComponent, ErrorComponent, ThemedLoadingComponent] } }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectComponent);
    comp = fixture.componentInstance;
    comp.dsoRD$ = mockItems;
    comp.paginationOptions = mockPaginationOptions;
    fixture.detectChanges();
    objectSelectService = (comp as any).objectSelectService;
  });

  it(`should show a list of ${mockItemList.length} items`, () => {
    const tbody: HTMLElement = fixture.debugElement.query(By.css('table#item-select tbody')).nativeElement;
    expect(tbody.children.length).toBe(mockItemList.length);
  });

  describe('checkboxes', () => {
    let checkbox: HTMLInputElement;

    beforeEach(() => {
      checkbox = fixture.debugElement.query(By.css('input.item-checkbox')).nativeElement;
    });

    it('should initially be unchecked', () => {
      expect(checkbox.checked).toBeFalsy();
    });

    it('should be checked when clicked', () => {
      checkbox.click();
      fixture.detectChanges();
      expect(checkbox.checked).toBeTruthy();
    });

    it('should switch the value through object-select-service', () => {
      spyOn((comp as any).objectSelectService, 'switch').and.callThrough();
      checkbox.click();
      expect((comp as any).objectSelectService.switch).toHaveBeenCalled();
    });
  });

  describe('when confirm is clicked', () => {
    let confirmButton: HTMLButtonElement;

    beforeEach(() => {
      confirmButton = fixture.debugElement.query(By.css('button.item-confirm')).nativeElement;
      spyOn(comp.confirm, 'emit').and.callThrough();
    });

    it('should emit the selected items', () => {
      confirmButton.click();
      expect(comp.confirm.emit).toHaveBeenCalled();
    });
  });

  describe('when cancel is clicked', () => {
    let cancelButton: HTMLButtonElement;

    beforeEach(() => {
      cancelButton = fixture.debugElement.query(By.css('button.item-cancel')).nativeElement;
      spyOn(comp.cancel, 'emit').and.callThrough();
    });

    it('should emit a cancel event', () => {
      cancelButton.click();
      expect(comp.cancel.emit).toHaveBeenCalled();
    });
  });

  describe('when the authorize feature is not authorized', () => {

    beforeEach(() => {
      comp.featureId = FeatureID.CanManageMappings;
      spyOn(authorizationDataService, 'isAuthorized').and.returnValue(of(false));
      comp.ngOnInit();
    });

    it('should disable the checkbox', waitForAsync(async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const checkbox = fixture.debugElement.query(By.css('input.item-checkbox')).nativeElement;
      expect(authorizationDataService.isAuthorized).toHaveBeenCalled();
      expect(checkbox.disabled).toBeTrue();
    }));
  });
});
