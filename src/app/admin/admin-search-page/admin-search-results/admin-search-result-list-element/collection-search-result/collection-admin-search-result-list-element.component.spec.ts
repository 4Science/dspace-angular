import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { APP_CONFIG } from '../../../../../../config/app-config.interface';
import { environment } from '../../../../../../environments/environment';
import { getCollectionEditRoute } from '../../../../../collection-page/collection-page-routing-paths';
import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { Collection } from '../../../../../core/shared/collection.model';
import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { DSONameServiceMock } from '../../../../../shared/mocks/dso-name.service.mock';
import { CollectionElementLinkType } from '../../../../../shared/object-collection/collection-element-link.type';
import { CollectionSearchResult } from '../../../../../shared/object-collection/shared/collection-search-result.model';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import { CollectionAdminSearchResultListElementComponent } from './collection-admin-search-result-list-element.component';

describe('CollectionAdminSearchResultListElementComponent', () => {
  let component: CollectionAdminSearchResultListElementComponent;
  let fixture: ComponentFixture<CollectionAdminSearchResultListElementComponent>;
  let id;
  let searchResult;

  function init() {
    id = '780b2588-bda5-4112-a1cd-0b15000a5339';
    searchResult = new CollectionSearchResult();
    searchResult.indexableObject = new Collection();
    searchResult.indexableObject.uuid = id;
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [CollectionAdminSearchResultListElementComponent],
      providers: [{ provide: TruncatableService, useValue: {} },
        { provide: DSONameService, useClass: DSONameServiceMock },
        { provide: APP_CONFIG, useValue: environment }],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionAdminSearchResultListElementComponent);
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

  it('should render an edit button with the correct link', () => {
    const a = fixture.debugElement.query(By.css('a'));
    const link = a.nativeElement.href;
    expect(link).toContain(getCollectionEditRoute(id));
  });
});
