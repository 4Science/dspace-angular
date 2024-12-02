import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { TranslateLoaderMock } from '../../../../../shared/mocks/translate-loader.mock';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../../../../shared/testing/notifications-service.stub';
import { IIIFToolbarComponent } from '../metadata/rendering-types/advanced-attachment/bitstream-attachment/attachment-render/types/iiif-toolbar/iiif-toolbar.component';
import { CrisLayoutIIIFToolbarBoxComponent } from './cris-layout-iiif-toolbar-box.component';

describe('CrisLayoutIiifToolbarBoxComponent', () => {
  let component: CrisLayoutIIIFToolbarBoxComponent;
  let fixture: ComponentFixture<CrisLayoutIIIFToolbarBoxComponent>;

  let notificationService: NotificationsServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        CrisLayoutIIIFToolbarBoxComponent,
      ],
      providers: [
        { provide: 'boxProvider', useValue: {} },
        { provide: 'itemProvider', useValue: {} },
        { provide: NotificationsService, useValue: notificationService },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ],
    })
      .overrideComponent(CrisLayoutIIIFToolbarBoxComponent, {
        remove: {
          imports: [IIIFToolbarComponent],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrisLayoutIIIFToolbarBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
