import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFToolbarComponent } from './iiif-toolbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { Item } from '../../core/shared/item.model';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { buildPaginatedList } from '../../core/data/paginated-list.model';
import { PageInfo } from '../../core/shared/page-info.model';
import { createRelationshipsObservable } from '../simple/item-types/shared/item.component.spec';

describe('IiifToolbarComponent', () => {
  let component: IIIFToolbarComponent;
  let fixture: ComponentFixture<IIIFToolbarComponent>;

  let translateService: TranslateService;

  const mockItem: Item = Object.assign(new Item(), {
    bundles: createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [])),
    metadata: {
      'publicationissue.issueNumber': [
        {
          language: 'en_US',
          value: '1234'
        }
      ],
      'creativework.datePublished': [
        {
          language: 'en_US',
          value: '2018'
        }
      ],
      'dc.description': [
        {
          language: 'en_US',
          value: 'desc'
        }
      ],
      'creativework.keywords': [
        {
          language: 'en_US',
          value: 'keyword'
        }
      ]
    },
    relationships: createRelationshipsObservable()
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IIIFToolbarComponent ],
      imports: [ RouterTestingModule.withRoutes([]), TranslateModule.forRoot() ],
      providers: [
        {provide: NotificationsService, useValue: NotificationsServiceStub}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFToolbarComponent);
    component = fixture.componentInstance;
    component.item = mockItem;
    fixture.detectChanges();

    translateService = (component as any).translate;
    spyOn(translateService, 'get').and.returnValue(observableOf('translated-message'));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
