import {
  ChangeDetectionStrategy,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';

import { APP_CONFIG } from '../../../../../../../config/app-config.interface';
import { AuthService } from '../../../../../../core/auth/auth.service';
import { DSONameService } from '../../../../../../core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '../../../../../../core/data/feature-authorization/authorization-data.service';
import { Item } from '../../../../../../core/shared/item.model';
import { ThemedThumbnailComponent } from '../../../../../../thumbnail/themed-thumbnail.component';
import { MetadataLinkViewComponent } from '../../../../../metadata-link-view/metadata-link-view.component';
import {
  DSONameServiceMock,
  UNDEFINED_NAME,
} from '../../../../../mocks/dso-name.service.mock';
import { mockTruncatableService } from '../../../../../mocks/mock-trucatable.service';
import { getMockThemeService } from '../../../../../mocks/theme-service.mock';
import { ItemSearchResult } from '../../../../../object-collection/shared/item-search-result.model';
import { ActivatedRouteStub } from '../../../../../testing/active-router.stub';
import { AuthServiceStub } from '../../../../../testing/auth-service.stub';
import { ThemeService } from '../../../../../theme-support/theme.service';
import { TruncatableComponent } from '../../../../../truncatable/truncatable.component';
import { TruncatableService } from '../../../../../truncatable/truncatable.service';
import { TruncatablePartComponent } from '../../../../../truncatable/truncatable-part/truncatable-part.component';
import { TruncatePipe } from '../../../../../utils/truncate.pipe';
import { MetricBadgesComponent } from '../../../../metric-badges/metric-badges.component';
import { MetricDonutsComponent } from '../../../../metric-donuts/metric-donuts.component';
import { AdditionalMetadataComponent } from '../../../additional-metadata/additional-metadata.component';
import { ItemSearchResultListElementComponent } from './item-search-result-list-element.component';

let publicationListElementComponent: ItemSearchResultListElementComponent;
let fixture: ComponentFixture<ItemSearchResultListElementComponent>;
const dcTitle = 'This is just another <em>title</em>';
const mockItemWithMetadata: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'dc.title': [{
      value: dcTitle,
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
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
    }),
});
const mockItemWithoutMetadata: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
      metadata: {},
    }),
});
const mockPerson: ItemSearchResult = Object.assign(new ItemSearchResult(), {
  hitHighlights: {
    'person.familyName': [{
      value: '<em>Michel</em>',
    }],
  },
  indexableObject:
    Object.assign(new Item(), {
      bundles: observableOf({}),
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
        'person.familyName': [
          {
            value: 'Michel',
          },
        ],
        'dspace.entity.type': [
          {
            value: 'Person',
          },
        ],
      },
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
      bundles: observableOf({}),
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
    }),
});
const environmentUseThumbs = {
  browseBy: {
    showThumbnails: true,
  },
};

const enviromentNoThumbs = {
  browseBy: {
    showThumbnails: false,
  },
};

describe('ItemSearchResultListElementComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        TruncatePipe,
        ItemSearchResultListElementComponent,
      ],
      providers: [
        { provide: TruncatableService, useValue: mockTruncatableService },
        { provide: DSONameService, useClass: DSONameServiceMock },
        { provide: APP_CONFIG, useValue: environmentUseThumbs },
        { provide: ThemeService, useValue: getMockThemeService() },
        { provide: AuthService, useValue: new AuthServiceStub() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
        {
          provide: AuthorizationDataService,
          useValue: jasmine.createSpyObj('AuthorizationDataService', [
            'invalidateAuthorizationsRequestCache',
          ]),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemSearchResultListElementComponent, {
      add: { changeDetection: ChangeDetectionStrategy.Default },
    }).overrideComponent(ItemSearchResultListElementComponent, {
      remove: { imports: [
        ThemedThumbnailComponent,
        TruncatableComponent,
        TruncatablePartComponent,
        AdditionalMetadataComponent,
        MetadataLinkViewComponent,
        MetricBadgesComponent,
        MetricDonutsComponent,
      ] },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemSearchResultListElementComponent);
    publicationListElementComponent = fixture.componentInstance;

  }));

  describe('with environment.browseBy.showThumbnails set to true', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });
    it('should set showThumbnails to true', () => {
      expect(publicationListElementComponent.showThumbnails).toBeTrue();
    });

    it('should add thumbnail element', () => {
      const thumbnailElement = fixture.debugElement.query(By.css('ds-thumbnail'));
      expect(thumbnailElement).toBeTruthy();
    });
  });

  describe('When the item has an author', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show the author paragraph', () => {
      const itemAuthorField = fixture.debugElement.query(By.css('span.item-list-authors'));
      expect(itemAuthorField).not.toBeNull();
    });
  });

  describe('When the item has no author', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    });

    it('should not show the author paragraph', () => {
      const itemAuthorField = fixture.debugElement.query(By.css('span.item-list-authors'));
      expect(itemAuthorField).toBeNull();
    });
  });

  describe('When the item has authors and isCollapsed is true', () => {
    beforeEach(() => {
      spyOn(publicationListElementComponent, 'isCollapsed').and.returnValue(observableOf(true));
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show limitedMetadata', () => {
      const authorElements = fixture.debugElement.queryAll(By.css('span.item-list-authors ds-metadata-link-view'));
      expect(authorElements.length).toBe(mockItemWithMetadata.indexableObject.limitedMetadata(publicationListElementComponent.authorMetadata, publicationListElementComponent.additionalMetadataLimit).length);
    });
  });

  describe('When the item has authors and isCollapsed is false', () => {
    beforeEach(() => {
      spyOn(publicationListElementComponent, 'isCollapsed').and.returnValue(observableOf(false));
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show allMetadata', () => {
      const authorElements = fixture.debugElement.queryAll(By.css('span.item-list-authors ds-metadata-link-view'));
      expect(authorElements.length).toBe(mockItemWithMetadata.indexableObject.allMetadata(publicationListElementComponent.authorMetadata).length);
    });
  });

  describe('When the item has a publisher', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show the publisher span', () => {
      const publisherField = fixture.debugElement.query(By.css('span.item-list-publisher'));
      expect(publisherField).not.toBeNull();
    });
  });

  describe('When the item has no publisher', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    });

    it('should not show the publisher span', () => {
      const publisherField = fixture.debugElement.query(By.css('span.item-list-publisher'));
      expect(publisherField).toBeNull();
    });
  });

  describe('When the item has an issuedate', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show the issuedate span', () => {
      const dateField = fixture.debugElement.query(By.css('span.item-list-date'));
      expect(dateField).not.toBeNull();
    });
  });

  describe('When the item has no issuedate', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    });

    it('should not show the issuedate span', () => {
      const dateField = fixture.debugElement.query(By.css('span.item-list-date'));
      expect(dateField).toBeNull();
    });
  });

  describe('When the item has an abstract', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show the abstract span', () => {
      const abstractField = fixture.debugElement.query(By.css('div.item-list-abstract'));
      expect(abstractField).not.toBeNull();
    });
  });

  describe('When the item has no abstract', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    });

    it('should not show the abstract span', () => {
      const abstractField = fixture.debugElement.query(By.css('div.item-list-abstract'));
      expect(abstractField).toBeNull();
    });
  });

  describe('When the item has title', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should show highlighted title', () => {
      const titleField = fixture.debugElement.query(By.css('.item-list-title'));
      expect(titleField.nativeNode.innerHTML).toEqual(dcTitle);
    });
  });

  describe('When the item is Person and has title', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockPerson;
      fixture.detectChanges();
    });

    it('should show highlighted title', () => {
      const titleField = fixture.debugElement.query(By.css('.item-list-title'));
      expect(titleField.nativeNode.innerHTML).toEqual('<em>Michel</em>');
    });
  });

  describe('When the item is orgUnit and has title', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockOrgUnit;
      fixture.detectChanges();
    });

    it('should show highlighted title', () => {
      const titleField = fixture.debugElement.query(By.css('.item-list-title'));
      expect(titleField.nativeNode.innerHTML).toEqual('<em>Science</em>');
    });
  });

  describe('When the item has no title', () => {
    beforeEach(() => {
      publicationListElementComponent.object = mockItemWithoutMetadata;
      fixture.detectChanges();
    });

    it('should show the fallback untitled translation', () => {
      const titleField = fixture.debugElement.query(By.css('.item-list-title'));
      expect(titleField.nativeElement.textContent.trim()).toEqual(UNDEFINED_NAME);
    });
  });
});

describe('ItemSearchResultListElementComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TruncatePipe, TranslateModule.forRoot(), ItemSearchResultListElementComponent],
      providers: [
        { provide: TruncatableService, useValue: mockTruncatableService },
        { provide: DSONameService, useClass: DSONameServiceMock },
        { provide: APP_CONFIG, useValue: enviromentNoThumbs },
        { provide: ThemeService, useValue: getMockThemeService() },
        { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(ItemSearchResultListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).overrideComponent(ItemSearchResultListElementComponent, {
      remove: { imports: [
        ThemedThumbnailComponent,
        TruncatableComponent,
        TruncatablePartComponent,
        AdditionalMetadataComponent,
        MetadataLinkViewComponent,
        MetricBadgesComponent,
        MetricDonutsComponent,
      ] },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(ItemSearchResultListElementComponent);
    publicationListElementComponent = fixture.componentInstance;
  }));

  describe('with environment.browseBy.showThumbnails set to false', () => {
    beforeEach(() => {

      publicationListElementComponent.object = mockItemWithMetadata;
      fixture.detectChanges();
    });

    it('should not add thumbnail element', () => {
      const thumbnailElement = fixture.debugElement.query(By.css('ds-thumbnail'));
      expect(thumbnailElement).toBeFalsy();
    });
  });
});
