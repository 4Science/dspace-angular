import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrisLayoutIIIFToolbarBoxComponent } from './cris-layout-iiif-toolbar-box.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateLoaderMock } from '../../../../../shared/mocks/translate-loader.mock';
import { NotificationsService } from '../../../../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../../../../shared/testing/notifications-service.stub';

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
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ CrisLayoutIIIFToolbarBoxComponent ],
      providers: [
        { provide: 'boxProvider', useValue: {} },
        { provide: 'itemProvider', useValue: {} },
        { provide: NotificationsService, useValue: notificationService },
        { provide: Router, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
      ]
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
