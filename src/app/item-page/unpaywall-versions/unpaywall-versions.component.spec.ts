import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnpaywallVersionsComponent } from './unpaywall-versions.component';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { UnpaywallItemService } from '../../core/data/unpaywall-item.service';
import { DefaultChangeAnalyzer } from '../../core/data/default-change-analyzer.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
import { RemoteDataBuildService } from '../../core/cache/builders/remote-data-build.service';
import { RequestService } from '../../core/data/request.service';
import { StoreModule } from '@ngrx/store';
import { requestReducer } from '../../core/data/request.reducer';
import { storeModuleConfig } from '../../app.reducer';
import { UUIDService } from '../../core/shared/uuid.service';
import { of, of as observableOf } from 'rxjs';
import { createSuccessfulRemoteDataObject } from '../../shared/remote-data.utils';
import { Item } from '../../core/shared/item.model';
import { MetadataValue } from '../../core/shared/metadata.models';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { UnpaywallItemVersionModel } from '../../core/submission/models/unpaywall-item-version.model';

const requestId = '8a6e0804-2bd0-4672-b79d-d97027f9071a';
const itemTitle = 'Item title';
const item = Object.assign(new Item(), {
  id: requestId,
  metadata: {
    'dc.title': [{ value: itemTitle } as MetadataValue]
  },
  _links: {
    irrelevant: {
      href: 'irrelevant link',
    }
  },
});
const route = {
  data: observableOf({
    dso: createSuccessfulRemoteDataObject(item),
  }),
  queryParams: of({
    autoForward: true
  })
};

describe('UnpaywallVersionsComponent', () => {
  let component: UnpaywallVersionsComponent;
  let fixture: ComponentFixture<UnpaywallVersionsComponent>;
  let location: Location;
  let unpaywallItemService;

  beforeEach(async () => {
    location = jasmine.createSpyObj({
      back: jasmine.createSpy()
    });
    unpaywallItemService = jasmine.createSpyObj({
      getItemVersions: jasmine.createSpy()
    });
    await TestBed.configureTestingModule({
      declarations: [UnpaywallVersionsComponent, TranslatePipe],
      imports: [
        HttpClientTestingModule,
        CommonModule,
        StoreModule.forRoot(requestReducer, storeModuleConfig),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useValue: TranslateLoaderMock
          }
        })
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Location, useValue: location },
        { provide: UnpaywallItemService, useValue: unpaywallItemService },
        DefaultChangeAnalyzer,
        HALEndpointService,
        NotificationsService,
        ObjectCacheService,
        RemoteDataBuildService,
        RequestService,
        UUIDService
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnpaywallVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('titleText', () => {
    it('should return observable of the page title', () => {
      component.titleText.subscribe(titleText => {
        expect(titleText).toEqual('submission.unpaywall.versions.title');
      });
    });
  });

  describe('isHostedInRepository', () => {
    it('should return true if version record is hosted in repository', () => {
      const versionRecord = {
        hostType: 'repository'
      } as UnpaywallItemVersionModel;

      expect(component.isHostedInRepository(versionRecord)).toBeTrue();
    });

    it('should return false if version record is hosted by publisher', () => {
      const versionRecord = {
        hostType: 'publisher'
      } as UnpaywallItemVersionModel;

      expect(component.isHostedInRepository(versionRecord)).toBeFalse();
    });
  });

  describe('back', () => {
    it('should redirect back to item page', () => {
      component.back();

      expect(location.back).toHaveBeenCalledTimes(1);
    });
  });

  describe('ngOnInit', () => {

    const version = {
      version: 'publishedVersion',
      hostType: 'repository',
      landingPageUrl: 'http://test.com/landing-page',
      pdfUrl: 'http://test.com/pdf',
      license: 'cc-by'
    } as UnpaywallItemVersionModel;

    beforeEach(() => {
      spyOn(window, 'open');
    });

    it('should fetch item version records', () => {
      unpaywallItemService.getItemVersions.withArgs(item).and.returnValue(of([version, version]));

      component.itemVersions$.subscribe(versions => {
        expect(versions).toEqual([version, version]);
        expect(window.open).not.toHaveBeenCalled();
      });
    });

    it('should fetch item version records and redirect to item resource (because there is only on version)', () => {
      unpaywallItemService.getItemVersions.withArgs(item).and.returnValue(of([version]));

      component.itemVersions$.subscribe(versions => {
        expect(versions).toEqual([version]);
        expect(window.open).toHaveBeenCalledWith(version.pdfUrl, '_blank');
      });
    });
  });

  describe('ngOnDestroy', () => {
    beforeEach(() => {
      component.onDestroy$ = jasmine.createSpyObj({
        next: jasmine.createSpy(),
        complete: jasmine.createSpy()
      });
    });

    it('should unsubscribe all subscriptions', () => {
      component.ngOnDestroy();

      expect(component.onDestroy$.next).toHaveBeenCalledTimes(1);
      expect(component.onDestroy$.complete).toHaveBeenCalledTimes(1);
    });
  });
});
