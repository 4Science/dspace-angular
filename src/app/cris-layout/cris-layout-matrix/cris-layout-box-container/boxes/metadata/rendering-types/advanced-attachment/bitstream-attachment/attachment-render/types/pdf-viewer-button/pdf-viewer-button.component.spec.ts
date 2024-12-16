import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthorizationDataService } from '../../../../../../../../../../../core/data/feature-authorization/authorization-data.service';
import { PdfViewerButtonComponent } from './pdf-viewer-button.component';

describe('PdfViewerButtonComponent', () => {
  let component: PdfViewerButtonComponent;
  let fixture: ComponentFixture<PdfViewerButtonComponent>;

  const authorizationServiceSpy = jasmine.createSpyObj('authorizationService', {
    isAuthorized: jasmine.createSpy('isAuthorized'),
  });

  authorizationServiceSpy.isAuthorized.and.returnValue(of(true));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{
        provide: AuthorizationDataService,
        useValue: authorizationServiceSpy,
      }],
      imports: [
        CommonModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        PdfViewerButtonComponent,
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
