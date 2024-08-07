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

import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { Community } from '../../../core/shared/community.model';
import { DSONameServiceMock } from '../../mocks/dso-name.service.mock';
import { CommunityListElementComponent } from './community-list-element.component';

let communityListElementComponent: CommunityListElementComponent;
let fixture: ComponentFixture<CommunityListElementComponent>;

const mockCommunityWithAbstract: Community = Object.assign(new Community(), {
  metadata: {
    'dc.description.abstract': [
      {
        language: 'en_US',
        value: 'Short description',
      },
    ],
  },
});

const mockCommunityWithoutAbstract: Community = Object.assign(new Community(), {
  metadata: {
    'dc.title': [
      {
        language: 'en_US',
        value: 'Test title',
      },
    ],
  },
});

describe('CommunityListElementComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityListElementComponent],
      providers: [
        { provide: DSONameService, useValue: new DSONameServiceMock() },
        { provide: 'objectElementProvider', useValue: (mockCommunityWithAbstract) },
      ],

      schemas: [NO_ERRORS_SCHEMA],
    }).overrideComponent(CommunityListElementComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default },
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(CommunityListElementComponent);
    communityListElementComponent = fixture.componentInstance;
  }));

  describe('When the community has an abstract', () => {
    beforeEach(() => {
      communityListElementComponent.object = mockCommunityWithAbstract;
      fixture.detectChanges();
    });

    it('should show the description paragraph', () => {
      const communityAbstractField = fixture.debugElement.query(By.css('div.abstract-text'));
      expect(communityAbstractField).not.toBeNull();
    });
  });

  describe('When the community has no abstract', () => {
    beforeEach(() => {
      communityListElementComponent.object = mockCommunityWithoutAbstract;
      fixture.detectChanges();
    });

    it('should not show the description paragraph', () => {
      const communityAbstractField = fixture.debugElement.query(By.css('div.abstract-text'));
      expect(communityAbstractField).toBeNull();
    });
  });
});
