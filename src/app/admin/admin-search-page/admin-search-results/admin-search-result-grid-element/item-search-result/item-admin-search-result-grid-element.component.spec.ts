import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AuthService } from '@dspace/core';
import { AccessStatusDataService } from '@dspace/core';
import { BitstreamDataService } from '@dspace/core';
import { AuthorizationDataService } from '@dspace/core';
import { RemoteData } from '@dspace/core';
import { ItemSearchResult } from '@dspace/core';
import { Bitstream } from '@dspace/core';
import { FileService } from '@dspace/core';
import { Item } from '@dspace/core';
import { ViewMode } from '@dspace/core';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core';
import { AuthServiceStub } from '@dspace/core';
import { AuthorizationDataServiceStub } from '@dspace/core';
import { FileServiceStub } from '@dspace/core';
import { mockTruncatableService } from '../../../../../shared/mocks/mock-trucatable.service';
import { getMockThemeService } from '../../../../../shared/mocks/theme-service.mock';
import { ListableModule } from '../../../../../shared/modules/listable.module';
import { CollectionElementLinkType } from '../../../../../shared/object-collection/collection-element-link.type';
import { AccessStatusObject } from '@dspace/core';
import { ThemeService } from '../../../../../shared/theme-support/theme.service';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import { ItemAdminSearchResultGridElementComponent } from './item-admin-search-result-grid-element.component';

describe('ItemAdminSearchResultGridElementComponent', () => {
  let component: ItemAdminSearchResultGridElementComponent;
  let fixture: ComponentFixture<ItemAdminSearchResultGridElementComponent>;
  let id;
  let searchResult;

  const mockBitstreamDataService = {
    getThumbnailFor(item: Item): Observable<RemoteData<Bitstream>> {
      return createSuccessfulRemoteDataObject$(new Bitstream());
    },
  };

  const mockAccessStatusDataService = {
    findAccessStatusFor(item: Item): Observable<RemoteData<AccessStatusObject>> {
      return createSuccessfulRemoteDataObject$(new AccessStatusObject());
    },
  };

  const mockThemeService = getMockThemeService();

  function init() {
    id = '780b2588-bda5-4112-a1cd-0b15000a5339';
    searchResult = new ItemSearchResult();
    searchResult.indexableObject = new Item();
    searchResult.indexableObject.uuid = id;
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule(
      {
        imports: [
          NoopAnimationsModule,
          TranslateModule.forRoot(),
          RouterTestingModule.withRoutes([]),
          ListableModule,
          ItemAdminSearchResultGridElementComponent,
        ],
        providers: [
          { provide: TruncatableService, useValue: mockTruncatableService },
          { provide: BitstreamDataService, useValue: mockBitstreamDataService },
          { provide: ThemeService, useValue: mockThemeService },
          { provide: AccessStatusDataService, useValue: mockAccessStatusDataService },
          { provide: AuthService, useClass: AuthServiceStub },
          { provide: FileService, useClass: FileServiceStub },
          { provide: AuthorizationDataService, useClass: AuthorizationDataServiceStub },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemAdminSearchResultGridElementComponent);
    component = fixture.componentInstance;
    component.object = searchResult;
    component.linkTypes = CollectionElementLinkType;
    component.index = 0;
    component.viewModes = ViewMode;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
