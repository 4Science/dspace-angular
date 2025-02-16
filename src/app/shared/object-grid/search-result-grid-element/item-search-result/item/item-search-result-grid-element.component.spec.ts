import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
  of,
} from 'rxjs';
import { HALEndpointServiceStub } from 'src/app/shared/testing/hal-endpoint-service.stub';

import { RemoteDataBuildService } from '../../../../../core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../../../../core/cache/object-cache.service';
import { BitstreamDataService } from '../../../../../core/data/bitstream-data.service';
import { CommunityDataService } from '../../../../../core/data/community-data.service';
import { ConfigurationDataService } from '../../../../../core/data/configuration-data.service';
import { DefaultChangeAnalyzer } from '../../../../../core/data/default-change-analyzer.service';
import { DSOChangeAnalyzer } from '../../../../../core/data/dso-change-analyzer.service';
import { FindListOptions } from '../../../../../core/data/find-list-options.model';
import {
  buildPaginatedList,
  PaginatedList,
} from '../../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../../core/data/remote-data';
import { Bitstream } from '../../../../../core/shared/bitstream.model';
import { HALEndpointService } from '../../../../../core/shared/hal-endpoint.service';
import { Item } from '../../../../../core/shared/item.model';
import { PageInfo } from '../../../../../core/shared/page-info.model';
import { UUIDService } from '../../../../../core/shared/uuid.service';
import { ThemedThumbnailComponent } from '../../../../../thumbnail/themed-thumbnail.component';
import { NotificationsService } from '../../../../notifications/notifications.service';
import { ThemedBadgesComponent } from '../../../../object-collection/shared/badges/themed-badges.component';
import { ItemSearchResult } from '../../../../object-collection/shared/item-search-result.model';
import {
  createNoContentRemoteDataObject$,
  createSuccessfulRemoteDataObject,
  createSuccessfulRemoteDataObject$,
} from '../../../../remote-data.utils';
import { ActivatedRouteStub } from '../../../../testing/active-router.stub';
import { createPaginatedList } from '../../../../testing/utils.test';
import { ThumbnailService } from '../../../../thumbnail/thumbnail.service';
import { TruncatableComponent } from '../../../../truncatable/truncatable.component';
import { TruncatableService } from '../../../../truncatable/truncatable.service';
import { TruncatablePartComponent } from '../../../../truncatable/truncatable-part/truncatable-part.component';
import { FollowLinkConfig } from '../../../../utils/follow-link-config.model';
import { TruncatePipe } from '../../../../utils/truncate.pipe';
import { ItemSearchResultGridElementComponent } from './item-search-result-grid-element.component';

const mockItemWithMetadata: ItemSearchResult = new ItemSearchResult();
mockItemWithMetadata.hitHighlights = {};
const dcTitle = 'This is just another <em>title</em>';
mockItemWithMetadata.indexableObject = Object.assign(new Item(), {
  hitHighlights: {
    'dc.title': [{
      value: dcTitle,
    }],
  },
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: dcTitle,
      },
    ],
    'dc.contributor.author': [
      {
        language: 'en_US',
        value: 'Smith, Donald',
      },
    ],
    'dc.date.issued': [
      {
        language: null,
        value: '2015-06-26',
      },
    ],
    'dc.description.abstract': [
      {
        language: 'en_US',
        value: 'This is an abstract',
      },
    ],
  },
  thumbnail: createNoContentRemoteDataObject$(),
});
const mockPerson: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'person.familyName': [{
      value: '<em>Michel</em>',
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
      entityType: 'Person',
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
        'dspace.entity.type': [
          {
            value: 'Person',
          },
        ],
        'person.familyName': [
          {
            value: 'Michel',
          },
        ],
      },
      thumbnail: createNoContentRemoteDataObject$(),
    }),
});
const mockOrgUnit: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'organization.legalName': [{
      value: '<em>Science</em>',
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
      entityType: 'OrgUnit',
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
        'organization.legalName': [
          {
            value: 'Science',
          },
        ],
        'dspace.entity.type': [
          {
            value: 'OrgUnit',
          },
        ],
      },
      thumbnail: createNoContentRemoteDataObject$(),
    }),
});

const mockItemWithoutMetadata: ItemSearchResult = new ItemSearchResult();
mockItemWithoutMetadata.hitHighlights = {};
mockItemWithoutMetadata.indexableObject = Object.assign(new Item(), {
  bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'This is just another title',
      },
    ],
  },
  thumbnail: createNoContentRemoteDataObject$(),
});

describe('ItemGridElementComponent', getEntityGridElementTestComponent(ItemSearchResultGridElementComponent, mockItemWithMetadata, mockItemWithoutMetadata, ['authors', 'date', 'abstract']));

/**
 * Create test cases for a grid component of an entity.
 * @param component                     The component's class
 * @param searchResultWithMetadata      An ItemSearchResult containing an item with metadata that should be displayed in the grid element
 * @param searchResultWithoutMetadata   An ItemSearchResult containing an item that's missing the metadata that should be displayed in the grid element
 * @param fieldsToCheck                 A list of fields to check. The tests expect to find html elements with class ".item-${field}", so make sure they exist in the html template of the grid element.
 *                                      For example: If one of the fields to check is labeled "authors", the html template should contain at least one element with class ".item-authors" that's
 *                                      present when the author metadata is available.
 */
export function getEntityGridElementTestComponent(component, searchResultWithMetadata: ItemSearchResult, searchResultWithoutMetadata: ItemSearchResult, fieldsToCheck: string[], thumbnailServiceMock?: any) {
  return () => {
    let comp;
    let fixture;

    const truncatableServiceStub: any = {
      isCollapsed: (id: number) => observableOf(true),
    };

    const mockBitstreamDataService = {
      getThumbnailFor(item: Item): Observable<RemoteData<Bitstream>> {
        return createSuccessfulRemoteDataObject$(new Bitstream());
      },
      findAllByItemAndBundleName(item: Item, bundleName: string, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Bitstream>[]): Observable<RemoteData<PaginatedList<Bitstream>>> {
        return createSuccessfulRemoteDataObject$(createPaginatedList([new Bitstream()]));
      },
    };

    const defaultThumbnailService = thumbnailServiceMock ?? jasmine.createSpyObj('ThumbnailService', {
      getConfig: jasmine.createSpy('getConfig'),
    });

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          NoopAnimationsModule,
          TranslateModule.forRoot(),
          TruncatePipe,
          component,
        ],
        providers: [
          { provide: TruncatableService, useValue: truncatableServiceStub },
          { provide: ObjectCacheService, useValue: {} },
          { provide: UUIDService, useValue: jasmine.createSpyObj('UUIDService', ['generate']) },
          { provide: Store, useValue: {} },
          { provide: RemoteDataBuildService, useValue: {} },
          { provide: CommunityDataService, useValue: {} },
          { provide: HALEndpointService, useValue: new HALEndpointServiceStub('test') },
          { provide: HttpClient, useValue: {} },
          { provide: DSOChangeAnalyzer, useValue: {} },
          { provide: NotificationsService, useValue: {} },
          { provide: DefaultChangeAnalyzer, useValue: {} },
          { provide: BitstreamDataService, useValue: mockBitstreamDataService },
          { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
          { provide: ConfigurationDataService, useValue: {} },
          { provide: ThumbnailService, useValue: defaultThumbnailService },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).overrideComponent(component, {
        add: { changeDetection: ChangeDetectionStrategy.Default },
        remove: {
          imports: [
            ThemedThumbnailComponent, ThemedBadgesComponent, TruncatableComponent, TruncatablePartComponent,
          ],
        },
      }).compileComponents();
    }));

    beforeEach(waitForAsync(() => {
      fixture = TestBed.createComponent(component);
      defaultThumbnailService.getConfig.and.returnValue(of(createSuccessfulRemoteDataObject(null)));
      comp = fixture.componentInstance;
    }));

    fieldsToCheck.forEach((field) => {
      describe(`when the item has "${field}" metadata`, () => {
        beforeEach(() => {
          comp.object = searchResultWithMetadata;
          fixture.detectChanges();
        });

        it(`should show the "${field}" field`, () => {
          const itemAuthorField = fixture.debugElement.query(By.css(`.item-${field}`));
          expect(itemAuthorField).not.toBeNull();
        });
      });

      describe(`when the item has no "${field}" metadata`, () => {
        beforeEach(() => {
          comp.object = searchResultWithoutMetadata;
          fixture.detectChanges();
        });

        it(`should not show the "${field}" field`, () => {
          const itemAuthorField = fixture.debugElement.query(By.css(`.item-${field}`));
          expect(itemAuthorField).toBeNull();
        });
      });

      describe('When the item has title', () => {
        beforeEach(() => {
          comp.object = mockItemWithMetadata;
          fixture.detectChanges();
        });
        it('should show highlighted title', () => {
          const titleField = fixture.debugElement.query(By.css('.card-title'));
          expect(titleField.nativeNode.innerHTML).toEqual(dcTitle);
        });
      });

      describe('When the item is Person and has title', () => {
        beforeEach(() => {
          comp.object = mockPerson;
          fixture.detectChanges();
        });

        it('should show highlighted title', () => {
          const titleField = fixture.debugElement.query(By.css('.card-title'));
          expect(titleField.nativeNode.innerHTML).toEqual('<em>Michel</em>');
        });
      });

      describe('When the item is orgUnit and has title', () => {
        beforeEach(() => {
          comp.object = mockOrgUnit;
          fixture.detectChanges();
        });

        it('should show highlighted title', () => {
          const titleField = fixture.debugElement.query(By.css('.card-title'));
          expect(titleField.nativeNode.innerHTML).toEqual('<em>Science</em>');
        });
      });
    });
  };
}

const truncatableServiceStub: any = {
  isCollapsed: (id: number) => observableOf(true),
};

const mockBitstreamDataService = jasmine.createSpyObj('BitstreamDataService', {
  findAllByItemAndBundleName: jasmine.createSpy('findAllByItemAndBundleName'),
});

const defaultThumbnailService = jasmine.createSpyObj('ThumbnailService', {
  getConfig: jasmine.createSpy('getConfig'),
});


export const getGridElementTestBet = (component) => {
  return {
    imports: [
      NoopAnimationsModule,
      TranslateModule.forRoot(),
      component,
      TruncatePipe,
    ],
    providers: [
      { provide: TruncatableService, useValue: truncatableServiceStub },
      { provide: ObjectCacheService, useValue: {} },
      { provide: UUIDService, useValue: jasmine.createSpyObj('UUIDService', ['generate']) },
      { provide: Store, useValue: {} },
      { provide: RemoteDataBuildService, useValue: {} },
      { provide: CommunityDataService, useValue: {} },
      { provide: HALEndpointService, useValue: new HALEndpointServiceStub('test') },
      { provide: HttpClient, useValue: {} },
      { provide: DSOChangeAnalyzer, useValue: {} },
      { provide: NotificationsService, useValue: {} },
      { provide: DefaultChangeAnalyzer, useValue: {} },
      { provide: BitstreamDataService, useValue: mockBitstreamDataService },
      { provide: ConfigurationDataService, useValue: {} },
      { provide: ThumbnailService, useValue: defaultThumbnailService },
      { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  };
};
