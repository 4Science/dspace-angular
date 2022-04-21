import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IIIFViewerComponent } from './iiif-viewer.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RouteService } from '../../core/services/route.service';
import { ItemDataService } from '../../core/data/item-data.service';
import { TranslateLoaderMock } from '../../shared/mocks/translate-loader.mock';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { Item } from '../../core/shared/item.model';
import { AuthServiceMock } from '../../shared/mocks/auth.service.mock';
import { of } from 'rxjs';

describe('IiifViewerComponent', () => {
  let component: IIIFViewerComponent;
  let fixture: ComponentFixture<IIIFViewerComponent>;

  const testItem = Object.assign(new Item(), {
    type: 'item',
    entityType: 'Publication',
    metadata: {
      'dc.title': [{
        'value': 'test item title',
        'language': null,
        'authority': null,
        'confidence': -1,
        'place': 0
      }],
      'dspace.iiif.enabled': [{
        'value': 'true',
        'language': null,
        'authority': null,
        'confidence': 0,
        'place': 0,
        'securityLevel': 0,
      }]
    },
    uuid: 'test-item-uuid',
  });

  const activatedRouteStub = Object.assign(new ActivatedRouteStub(), {
    data: of({
      dso: createSuccessfulRemoteDataObject$<Item>(testItem),
    })
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [IIIFViewerComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: AuthService, useValue: new AuthServiceMock() },
        { provide: RouteService, useValue: {} },
        { provide: ItemDataService, useValue: {} },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IIIFViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
