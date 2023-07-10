import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfViewerButtonComponent } from './pdf-viewer-button.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  AuthorizationDataService
} from '../../../../../../../../../../../core/data/feature-authorization/authorization-data.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('PdfViewerButtonComponent', () => {
  let component: PdfViewerButtonComponent;
  let fixture: ComponentFixture<PdfViewerButtonComponent>;

  const authorizationServiceSpy = jasmine.createSpyObj('authorizationService', {
    isAuthorized: jasmine.createSpy('isAuthorized')
  });

  authorizationServiceSpy.isAuthorized.and.returnValue(of(true));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfViewerButtonComponent ],
      providers: [{
        provide: AuthorizationDataService,
        useValue: authorizationServiceSpy
      }],
      imports: [
        CommonModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot()
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfViewerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
